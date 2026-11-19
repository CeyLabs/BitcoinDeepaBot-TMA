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
  /** Paid, but our team checks it before the sats are sent */
  held: boolean;
  /** The checkout can be paid until then */
  expires_at: string;
}

/**
 * Re-check every 4s while the payment or the sats are on their way, false
 * once it's done. AWAITING_PAYMENT: PayHere's notification usually lands
 * within seconds of the redirect back.
 */
export function buyOrderPollInterval(order: BuyOrder | undefined): number | false {
  if (!order) return false;
  if (order.status === "AWAITING_PAYMENT" || order.status === "PENDING") {
    // Slow down once it's clearly not a matter of seconds
    const ageMs = Date.now() - new Date(order.created_at).getTime();
    return ageMs < 5 * 60_000 ? 4_000 : 15_000;
  }
  // Held: a person releases it, so check now and then
  if (order.status === "SUCCESS" && !order.settled) return order.held ? 30_000 : 4_000;
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

/** Order ids are UUIDs; anything else (e.g. a crafted ?buy_order=) isn't requested. */
export const isBuyOrderId = (id: string | null): id is string =>
  !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function useBuyOrder(id: string | null) {
  const isAuthed = useAuthed();
  return useQuery({ ...buyOrderOptions(id ?? ""), enabled: isAuthed && isBuyOrderId(id) });
}

export function useCreateBuyLink() {
  return useMutation({
    mutationFn: (amountLkr: number) =>
      fetchy.post<{ link: string; order_id: string }, { amount_lkr: number }>("/buy/payhere-link", {
        amount_lkr: amountLkr,
      }),
  });
}
