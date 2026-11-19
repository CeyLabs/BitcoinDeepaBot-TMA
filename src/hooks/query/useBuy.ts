"use client";

import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";

export interface BuyPrice {
  btcLkrPrice: number;
  paymentProcessorFeeBasisPoints: number;
  bitcoindeepaFeeBasisPoints: number;
  minLkr: number;
  maxLkr: number;
  dailyMaxLkr: number;
}

export type BuyOrderStatus =
  "AWAITING_PAYMENT" | "PENDING" | "SUCCESS" | "CANCELLED" | "FAILED" | "CHARGEBACK";

export interface BuyOrder {
  order_id: string;
  amount_lkr: number;
  currency: string;
  created_at: string;
  status: BuyOrderStatus;
  payhere_pay_id: string | null;
  satoshis: number | null;
  settled: boolean;
}

/**
 * Re-check every 4s while the payment or the sats are on their way, false
 * once it's done. AWAITING_PAYMENT: PayHere's notification usually lands
 * within seconds of the redirect back.
 */
export function buyOrderPollInterval(order: BuyOrder | undefined): number | false {
  if (!order) return false;
  if (order.status === "AWAITING_PAYMENT" || order.status === "PENDING") return 4_000;
  if (order.status === "SUCCESS" && !order.settled) return 4_000;
  return false;
}

export const buyPriceOptions = () =>
  queryOptions({
    queryKey: queryKeys.buyPrice,
    queryFn: () => fetchy.get<BuyPrice>("/buy/price"),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

export const buyOrderOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.buyOrder(id),
    queryFn: () => fetchy.get<BuyOrder>(`/buy/orders/${id}`),
    staleTime: 0,
    refetchInterval: (query) => buyOrderPollInterval(query.state.data),
  });

function useAuthed() {
  return useSession().status === "authenticated";
}

export function useBuyPrice(enabled = true) {
  const isAuthed = useAuthed();
  return useQuery({ ...buyPriceOptions(), enabled: isAuthed && enabled });
}

export function useBuyOrder(id: string | null) {
  const isAuthed = useAuthed();
  return useQuery({ ...buyOrderOptions(id ?? ""), enabled: isAuthed && !!id });
}

export function useCreateBuyLink() {
  return useMutation({
    mutationFn: (amountLkr: number) =>
      fetchy.post<{ link: string; order_id: string }, { amount_lkr: number }>("/buy/payhere-link", {
        amount_lkr: amountLkr,
      }),
  });
}
