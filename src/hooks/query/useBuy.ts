"use client";

import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy, { FetchyError } from "@/lib/fetchy";
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
  // Slow down once it's clearly not a matter of seconds
  const ageMs = Date.now() - new Date(order.created_at).getTime();
  const interval = ageMs < 5 * 60_000 ? 4_000 : 15_000;
  if (order.status === "AWAITING_PAYMENT") return isUnpaidAndExpired(order) ? false : interval;
  if (order.status === "PENDING") return interval;
  // Held: a person releases it, so check now and then
  if (order.status === "SUCCESS" && !order.settled) return order.held ? 30_000 : interval;
  return false;
}

/** The backend still accepts (and holds) a payment this long after expires_at */
const BUY_ORDER_EXPIRY_GRACE_MS = 10 * 60_000;

/** Never paid, and past the point where PayHere could still confirm it. */
export function isUnpaidAndExpired(order: BuyOrder): boolean {
  return (
    order.status === "AWAITING_PAYMENT" &&
    Date.now() > new Date(order.expires_at).getTime() + BUY_ORDER_EXPIRY_GRACE_MS
  );
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
    // A 4xx (e.g. 404: another account's order) won't change on retry
    retry: (failures, error) =>
      !(error instanceof FetchyError && error.status < 500) && failures < 3,
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
