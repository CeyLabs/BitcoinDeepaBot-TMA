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
  amount_lkr: string;
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
// oldest page first via offset/limit, sorted oldest-first once flattened.
export function useBotTransactionHistory() {
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

      const transactions = data.success ? data.transactions : [];
      const hasMore = data.success && data.offset + transactions.length < data.count;

      return {
        transactions,
        nextOffset: data.offset + PAGE_SIZE,
        hasMore,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
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
