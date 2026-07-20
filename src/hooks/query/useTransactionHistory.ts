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
  status: string;
}

interface RawTransaction {
  payhere_pay_id: string;
  created_at: string;
  satoshis_purchased?: string | number;
  btc_price_at_purchase?: string | number;
  package_amount?: string | number;
  status: string;
}

interface TransactionListResponse {
  transactions: RawTransaction[] | { transactions: RawTransaction[] };
}

function toNumber(value: string | number | undefined): number {
  if (value === undefined) return 0;
  return typeof value === "string" ? Number(value.replace(/,/g, "")) || 0 : value;
}

// Successful DCA purchases, sorted oldest-first, with numeric fields normalized.
export function useTransactionHistory() {
  const authToken = getAuthTokenFromStorage();

  return useQuery<DcaTransaction[]>({
    queryKey: queryKeys.transactions,
    queryFn: async () => {
      const data = await fetchy.get<TransactionListResponse>(
        "/api/transaction/list?limit=100",
        {
          headers: { Authorization: `Bearer ${authToken}` },
          shouldCache: false,
        }
      );
      const raw = Array.isArray(data.transactions)
        ? data.transactions
        : (data.transactions?.transactions ?? []);

      return raw
        .filter((tx) => tx.status === "SUCCESS")
        .map((tx) => ({
          id: tx.payhere_pay_id,
          created_at: tx.created_at,
          satoshis_purchased: toNumber(tx.satoshis_purchased),
          btc_price_at_purchase: toNumber(tx.btc_price_at_purchase),
          package_amount: toNumber(tx.package_amount),
          status: tx.status,
        }))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
  });
}
