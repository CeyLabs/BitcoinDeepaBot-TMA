"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAuthTokenFromStorage, getUserFromToken } from "@/lib/auth";
import type { BotTransaction } from "@/lib/types";
import fetchy from "@/lib/fetchy";

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
  const userId = getUserFromToken()?.id ?? "";

  const query = useInfiniteQuery({
    queryKey: queryKeys.botTransactions(userId),
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
