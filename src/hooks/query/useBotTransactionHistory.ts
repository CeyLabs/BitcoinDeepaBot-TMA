"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAuthTokenFromStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";

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
  amount_lkr: string | number | null;
  memo?: string;
  success: boolean;
}

interface BotTransactionsResponse {
  success: boolean;
  count: number;
  limit: number;
  offset: number;
  transactions: BotTransaction[];
  message?: string;
}

const PAGE_SIZE = 50;

// Sats sent/received to other Telegram users via the bot, paginated
// newest page first via offset/limit, sorted oldest-first once flattened.
export function useBotTransactionHistory({ enabled = true }: { enabled?: boolean } = {}) {
  const authToken = getAuthTokenFromStorage();

  const query = useInfiniteQuery({
    queryKey: queryKeys.botTransactions,
    queryFn: async ({ pageParam }) => {
      const data = await fetchy.get<BotTransactionsResponse>(
        `/api/transaction/bot-history?limit=${PAGE_SIZE}&offset=${pageParam}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
          shouldCache: false,
        }
      );

      // The backend reports bot-API failures as { success: false } rather
      // than an HTTP error — surface it as a query error instead of
      // silently rendering "no transactions".
      if (!data.success) {
        throw new Error(data.message || "Failed to load bot transactions");
      }

      const { transactions } = data;
      // Advance by what was actually returned (the backend may cap `limit`),
      // and stop on an empty page even if `count` disagrees.
      const nextOffset = data.offset + transactions.length;
      const hasMore = transactions.length > 0 && nextOffset < data.count;

      return { transactions, nextOffset, hasMore };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    enabled: enabled && !!authToken,
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
