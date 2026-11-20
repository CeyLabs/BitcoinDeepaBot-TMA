"use client";

import { useEffect } from "react";
import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";

export type SellStatus =
  | "QUOTED"
  | "EXPIRED"
  | "COLLECTING"
  | "SATS_COLLECTED"
  | "PAYOUT_PENDING"
  | "COMPLETED"
  | "REFUNDING"
  | "REFUNDED"
  | "NEEDS_REVIEW";

export interface SellOrder {
  id: string;
  status: SellStatus;
  sats: number;
  feeBasisPoints: number;
  /** The whole sale at the rate, before the fee */
  grossLkr: number;
  feeLkr: number;
  /** Flat bank transfer charge, taken after the fee */
  bankChargeLkr: number;
  btcLkrRate: number;
  amountLkr: number;
  expiresAt: string;
  bankRef: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
  /** While COLLECTING: the user approves the payment of the sats */
  collect: SellCollect | null;
}

/**
 * The payment the user approves to finish a sale (the bot's collect request).
 * state: requesting (being set up), pending (waiting for the user),
 * awaiting_confirmation (approved; Confirm in the bot chat), processing /
 * in_flight / completed (being paid).
 */
export type SellCollectState =
  | "requesting"
  | "pending"
  | "awaiting_confirmation"
  | "processing"
  | "in_flight"
  | "completed"
  | "failed"
  | "declined"
  | "cancelled"
  | "expired";

export interface SellCollect {
  state: SellCollectState;
  /** Approve before this, or the sale is cancelled (nothing sold) */
  expiresAt: string;
  /** Pay from the app; otherwise only in the bot chat */
  payInApp: boolean;
}

export interface SellPrice {
  btcLkrRate: number;
  feeBasisPoints: number;
  /** Flat LKR bank charge per sale, taken after the fee */
  bankChargeLkr?: number;
  /** Smallest and largest single sale the backend accepts */
  minSats?: number;
  maxSats?: number;
}

/** Statuses where the sale or its refund is still moving. */
export const IN_PROGRESS_SELL_STATUSES: SellStatus[] = [
  "COLLECTING",
  "SATS_COLLECTED",
  "PAYOUT_PENDING",
  "REFUNDING",
];

/**
 * How often to re-check an order, or false once it is final:
 * - waiting for the user to approve the payment (in the bot chat too): 3s
 * - sats being taken, payout on its way, or sats being returned: every 5s
 * - QUOTED: a confirm may still be in flight (the app lost the response), or
 *   the quote will expire within a minute: every 5s until it settles
 * - NEEDS_REVIEW: a human is checking; it ends in a final status: every 15s
 */
export function sellOrderPollInterval(status: SellStatus | undefined): number | false {
  if (!status) return false;
  if (status === "COLLECTING") return 3_000;
  if (status === "QUOTED" || IN_PROGRESS_SELL_STATUSES.includes(status)) return 5_000;
  if (status === "NEEDS_REVIEW") return 15_000;
  return false;
}

export const sellPriceOptions = () =>
  queryOptions({
    queryKey: queryKeys.sellPrice,
    queryFn: () => fetchy.get<SellPrice>("/sell/price"),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

export const sellOrdersOptions = () =>
  queryOptions({
    queryKey: queryKeys.sellOrders,
    queryFn: () => fetchy.get<SellOrder[]>("/sell/orders"),
    staleTime: 0,
  });

export const sellOrderOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.sellOrder(id),
    queryFn: () => fetchy.get<SellOrder>(`/sell/orders/${id}`),
    staleTime: 0,
    refetchInterval: (query) => sellOrderPollInterval(query.state.data?.status),
  });

function useAuthed() {
  return useSession().status === "authenticated";
}

export function useSellPrice(enabled = true) {
  const isAuthed = useAuthed();
  return useQuery({ ...sellPriceOptions(), enabled: isAuthed && enabled });
}

export function useSellOrders(enabled = true) {
  const isAuthed = useAuthed();
  return useQuery({ ...sellOrdersOptions(), enabled: isAuthed && enabled });
}

export function useSellOrder(id: string) {
  const isAuthed = useAuthed();
  return useQuery({ ...sellOrderOptions(id), enabled: isAuthed && !!id });
}

/**
 * Follows the history's sales that are still moving, each with its own order
 * query (it polls only while the sale moves), instead of re-polling the whole
 * history. When one settles, the history and the wallet refresh once.
 */
export function useRefreshWhenSalesSettle(sales: SellOrder[]) {
  const isAuthed = useAuthed();
  const queryClient = useQueryClient();
  const moving = sales.filter((sale) => sellOrderPollInterval(sale.status) !== false);
  const settled = useQueries({
    queries: moving.map((sale) => ({ ...sellOrderOptions(sale.id), enabled: isAuthed })),
    combine: (results) =>
      results
        .filter((q) => q.data && sellOrderPollInterval(q.data.status) === false)
        .map((q) => q.data?.id)
        .join(","),
  });

  useEffect(() => {
    if (!settled) return;
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary });
  }, [settled, queryClient]);
}

export function useSellQuote() {
  return useMutation({
    mutationFn: (sats: number) => fetchy.post<SellOrder>("/sell/quote", { sats }),
  });
}

/** Refresh what a sale's payment changes: the wallet, history and orders */
function useInvalidateAfterSale() {
  const queryClient = useQueryClient();
  return (order?: SellOrder) => {
    if (order) queryClient.setQueryData(queryKeys.sellOrder(order.id), order);
    void queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary });
    void queryClient.invalidateQueries({ queryKey: ["bot-transactions"] });
    // The sale is in the member's history (/transaction/list)
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.sellOrders });
  };
}

/**
 * Pay a confirmed sale from the app, as the signed-in user. 401
 * relogin_required: the bot hasn't linked the user yet, so log in again.
 */
export function usePaySell(id: string) {
  const refresh = useInvalidateAfterSale();
  return useMutation({
    mutationFn: () => fetchy.post<SellOrder>(`/sell/orders/${id}/pay`),
    onSuccess: (order) => refresh(order),
    onError: () => refresh(),
  });
}

/** Cancel a sale that isn't paid yet (nothing is sold) */
export function useCancelSell(id: string) {
  const refresh = useInvalidateAfterSale();
  return useMutation({
    mutationFn: () => fetchy.post<SellOrder>(`/sell/orders/${id}/cancel`),
    onSuccess: (order) => refresh(order),
  });
}

export function useConfirmSell() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchy.post<SellOrder>(`/sell/orders/${id}/confirm`),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.sellOrder(order.id), order);
    },
    onSettled: () => {
      // Sats left the wallet (or not): refresh balance, history and orders
      void queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary });
      void queryClient.invalidateQueries({ queryKey: ["bot-transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sellOrders });
    },
  });
}
