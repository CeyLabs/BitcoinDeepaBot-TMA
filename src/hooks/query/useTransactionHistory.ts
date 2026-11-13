"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAuthTokenFromStorage, getUserFromToken } from "@/lib/auth";
import fetchy, { FetchyError } from "@/lib/fetchy";

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

interface PaginatedTransactions {
  transactions: RawTransaction[];
  has_more?: boolean;
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
// paginated newest page first via `has_more`, sorted oldest-first within the
// flattened result with numeric fields normalized.
export function useTransactionHistory({ enabled = true }: { enabled?: boolean } = {}) {
  const authToken = getAuthTokenFromStorage();
  const userId = getUserFromToken()?.id ?? "";

  const query = useInfiniteQuery({
    queryKey: queryKeys.transactions(userId),
    queryFn: async ({ pageParam }) => {
      let data: RawTransaction[] | PaginatedTransactions;
      try {
        data = await fetchy.get<RawTransaction[] | PaginatedTransactions>(
          `/transaction/list?page=${pageParam}&limit=${PAGE_SIZE}`
        );
      } catch (error) {
        if (error instanceof FetchyError && error.status === 404) {
          return { transactions: [], hasMore: false };
        }
        throw error;
      }

      const nested = Array.isArray(data) ? null : data;
      const raw = Array.isArray(data) ? data : (nested?.transactions ?? []);

      return {
        transactions: raw.map(normalize),
        hasMore: nested?.has_more ?? raw.length === PAGE_SIZE,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    enabled: enabled && !!authToken,
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
