"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";

export type SellStatus =
  | "QUOTED"
  | "EXPIRED"
  | "SATS_COLLECTED"
  | "PAYOUT_PENDING"
  | "COMPLETED"
  | "REFUNDED"
  | "NEEDS_REVIEW";

export interface SellOrder {
  id: string;
  status: SellStatus;
  sats: number;
  feeBasisPoints: number;
  feeSats: number;
  netSats: number;
  btcLkrRate: number;
  amountLkr: number;
  expiresAt: string;
  bankRef: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface SellPrice {
  btcLkrRate: number;
  feeBasisPoints: number;
}

/** Statuses where the payout is still on its way. */
export const IN_PROGRESS_SELL_STATUSES: SellStatus[] = ["SATS_COLLECTED", "PAYOUT_PENDING"];

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
    // Poll while the payout is on its way
    refetchInterval: (query) =>
      query.state.data && IN_PROGRESS_SELL_STATUSES.includes(query.state.data.status)
        ? 5_000
        : false,
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
