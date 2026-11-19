"use client";

import { infiniteQueryOptions, useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import fetchy, { FetchyError } from "@/lib/fetchy";
import { IN_PROGRESS_SELL_STATUSES, type SellOrder } from "@/hooks/query/useSell";

export interface DcaTransaction {
  id: string;
  created_at: string;
  satoshis_purchased: number;
  btc_price_at_purchase: number;
  package_amount: number;
  gross_amount: number;
  /** Amount that bought BTC (gross minus fees); 0 on older rows */
  net_amount: number;
  package_name?: string;
  /** RECURRING = plan charge, ONE_TIME = one-time buy */
  kind: "RECURRING" | "ONE_TIME";
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
  net_amount?: string | number | null;
  package_name?: string;
  kind?: "RECURRING" | "ONE_TIME";
  status: string;
  settled?: boolean;
}

/**
 * One row of /transaction/list: a purchase (the transaction row, `type: "BUY"`)
 * or a sale (`type: "SELL"`, the order as the sell endpoints show it). Older
 * backends send purchases only, without `type`.
 */
type RawHistoryItem =
  (RawTransaction & { type?: "BUY" }) | { type: "SELL"; created_at: string; sell_order: SellOrder };

interface PaginatedTransactions {
  transactions: RawHistoryItem[];
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
    net_amount: toNumber(tx.net_amount),
    package_name: tx.package_name,
    kind: tx.kind ?? "RECURRING",
    status: tx.status,
    settled: tx.settled,
  };
}

// The member's history: all DCA purchase attempts (success, pending,
// cancelled, failed, chargeback) and sales, paginated newest page first via
// `has_more` (a page is cut across both). Purchases come back sorted
// oldest-first with numeric fields normalized; sales newest-first.
type TransactionPage = { transactions: DcaTransaction[]; sales: SellOrder[]; hasMore: boolean };
type TransactionHistory = { transactions: DcaTransaction[]; sales: SellOrder[] };

const NO_TRANSACTIONS: DcaTransaction[] = [];
const NO_SALES: SellOrder[] = [];

const time = (iso: string) => new Date(iso).getTime();

// Flattened and sorted (kept stable between renders by `select`).
const flattenTransactions = (data: InfiniteData<TransactionPage>): TransactionHistory => ({
  transactions: data.pages
    .flatMap((page) => page.transactions)
    .sort((a, b) => time(a.created_at) - time(b.created_at)),
  sales: data.pages
    .flatMap((page) => page.sales)
    .sort((a, b) => time(b.createdAt) - time(a.createdAt)),
});

export const transactionsOptions = (userId: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.transactions(userId),
    queryFn: async ({ pageParam }): Promise<TransactionPage> => {
      let data: RawTransaction[] | PaginatedTransactions;
      try {
        data = await fetchy.get<RawTransaction[] | PaginatedTransactions>(
          `/transaction/list?page=${pageParam}&limit=${PAGE_SIZE}`
        );
      } catch (error) {
        if (error instanceof FetchyError && error.status === 404) {
          return { transactions: [], sales: [], hasMore: false };
        }
        throw error;
      }

      const nested = Array.isArray(data) ? null : data;
      const raw: RawHistoryItem[] = Array.isArray(data) ? data : (nested?.transactions ?? []);

      const transactions: DcaTransaction[] = [];
      const sales: SellOrder[] = [];
      for (const item of raw) {
        if (item.type === "SELL") sales.push(item.sell_order);
        else transactions.push(normalize(item));
      }

      return {
        transactions,
        sales,
        hasMore: nested?.has_more ?? raw.length === PAGE_SIZE,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    staleTime: 1000 * 60 * 5,
    // A sale still moving (sats being taken, payout on its way, refund):
    // follow it until it settles
    refetchInterval: (query) =>
      query.state.data?.pages.some((page) =>
        page.sales.some((sale) => IN_PROGRESS_SELL_STATUSES.includes(sale.status))
      )
        ? 15_000
        : false,
    select: flattenTransactions,
  });

export function useTransactionHistory({ enabled = true }: { enabled?: boolean } = {}) {
  const session = useSession();
  const isAuthed = session.status === "authenticated";
  const userId = session.user?.id ?? "";

  const query = useInfiniteQuery({ ...transactionsOptions(userId), enabled: enabled && isAuthed });
  return {
    ...query,
    transactions: query.data?.transactions ?? NO_TRANSACTIONS,
    sales: query.data?.sales ?? NO_SALES,
  };
}
