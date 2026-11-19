"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";
import { useP2pHeaders } from "@/hooks/query/useP2p";

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
    void queryClient.invalidateQueries({ queryKey: queryKeys.sellOrders });
  };
}

/**
 * Pay a confirmed sale from the app, with the user's Telegram credential (the
 * Mini App's launch data; on the web the backend keeps the latest login).
 * 403 credential_stale / credential_rejected: reopen the app or log in again.
 */
export function usePaySell(id: string) {
  const headers = useP2pHeaders();
  const refresh = useInvalidateAfterSale();
  return useMutation({
    mutationFn: () => fetchy.post<SellOrder>(`/sell/orders/${id}/pay`, undefined, { headers }),
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.sellOrders });
    },
  });
}
