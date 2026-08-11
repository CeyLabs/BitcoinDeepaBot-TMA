"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAuthTokenFromStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";

export interface DcaTransaction {
  id: string;
  created_at: string;
  satoshis_purchased: number;
  btc_price_at_purchase: number;
  package_amount: number;
  gross_amount: number;
  package_name?: string;
  status: string;
  settled?: boolean;
}

interface RawTransaction {
  payhere_pay_id: string;
  created_at: string;
  satoshis_purchased?: string | number | null;
  btc_price_at_purchase?: string | number | null;
  package_amount?: string | number | null;
  gross_amount?: string | number | null;
  package_name?: string;
  status: string;
  settled?: boolean;
}

export interface BotTransaction {
  id: number;
  time: string;
  direction: "incoming" | "outgoing";
  from_id: number;
  to_id: number;
  from_user?: string;
  to_user?: string;
  type: string;
  amount: number;
  amount_lkr: string;
  memo?: string;
  success: boolean;
}

interface PlanHistoryResponse {
  transactions: { plan?: RawTransaction }[];
  has_more: boolean;
}

interface BotHistoryResponse {
  transactions: { bot?: BotTransaction }[];
  has_more: boolean;
}

const PAGE_SIZE = 20;

function toNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  return typeof value === "string" ? Number(value.replace(/,/g, "")) || 0 : value;
}

function normalize(tx: RawTransaction): DcaTransaction {
  return {
    id: tx.payhere_pay_id,
    created_at: tx.created_at,
    satoshis_purchased: toNumber(tx.satoshis_purchased),
    btc_price_at_purchase: toNumber(tx.btc_price_at_purchase),
    package_amount: toNumber(tx.package_amount),
    gross_amount: toNumber(tx.gross_amount),
    package_name: tx.package_name,
    status: tx.status,
    settled: tx.settled,
  };
}

// All DCA purchase attempts (success, pending, cancelled, failed, chargeback),
// paginated oldest page first via `has_more`, sorted oldest-first within the
// flattened result with numeric fields normalized.
export function useTransactionHistory() {
  const authToken = getAuthTokenFromStorage();

  const query = useInfiniteQuery({
    queryKey: queryKeys.transactions,
    queryFn: async ({ pageParam }) => {
      const data = await fetchy.get<PlanHistoryResponse>(
        `/api/transaction/history?type=plan&page=${pageParam}&limit=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
          shouldCache: false,
        }
      );

      const raw = data.transactions
        .map((item) => item.plan)
        .filter((tx): tx is RawTransaction => Boolean(tx));

      return {
        transactions: raw.map(normalize),
        hasMore: data.has_more,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
  });

  const transactions = useMemo(
    () =>
      (query.data?.pages ?? [])
        .flatMap((page) => page.transactions)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [query.data]
  );

  return { ...query, transactions };
}

// Sats sent/received to other Telegram users via the bot, paginated
// oldest page first via `has_more`, sorted oldest-first once flattened.
export function useBotTransactionHistory() {
  const authToken = getAuthTokenFromStorage();

  const query = useInfiniteQuery({
    queryKey: queryKeys.botTransactions,
    queryFn: async ({ pageParam }) => {
      const data = await fetchy.get<BotHistoryResponse>(
        `/api/transaction/history?type=bot&page=${pageParam}&limit=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
          shouldCache: false,
        }
      );

      const transactions = data.transactions
        .map((item) => item.bot)
        .filter((tx): tx is BotTransaction => Boolean(tx));

      return {
        transactions,
        hasMore: data.has_more,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
  });

  const transactions = useMemo(
    () =>
      (query.data?.pages ?? [])
        .flatMap((page) => page.transactions)
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    [query.data]
  );

  return { ...query, transactions };
}
