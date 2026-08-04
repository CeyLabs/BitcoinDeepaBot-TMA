"use client";

import { useQuery } from "@tanstack/react-query";
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

interface TransactionListResponse {
  transactions: RawTransaction[] | { transactions: RawTransaction[] };
}

function toNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  return typeof value === "string" ? Number(value.replace(/,/g, "")) || 0 : value;
}

// All DCA purchase attempts (success, pending, cancelled, failed, chargeback),
// sorted oldest-first, with numeric fields normalized.
export function useTransactionHistory() {
  const authToken = getAuthTokenFromStorage();

  return useQuery<DcaTransaction[]>({
    queryKey: queryKeys.transactions,
    queryFn: async () => {
      const data = await fetchy.get<TransactionListResponse>("/api/transaction/list?limit=100", {
        headers: { Authorization: `Bearer ${authToken}` },
        shouldCache: false,
      });
      const raw = Array.isArray(data.transactions)
        ? data.transactions
        : (data.transactions?.transactions ?? []);

      return raw
        .map((tx) => ({
          id: tx.payhere_pay_id,
          created_at: tx.created_at,
          satoshis_purchased: toNumber(tx.satoshis_purchased),
          btc_price_at_purchase: toNumber(tx.btc_price_at_purchase),
          package_amount: toNumber(tx.package_amount),
          gross_amount: toNumber(tx.gross_amount),
          package_name: tx.package_name,
          status: tx.status,
          settled: tx.settled,
        }))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
  });
}
