"use client";

import { infiniteQueryOptions, useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import type { BotTransaction } from "@/lib/types";
import fetchy, { FetchyError } from "@/lib/fetchy";

interface BotTransactionsResponse {
  success: boolean;
  count: number;
  limit: number;
  offset: number;
  transactions: BotTransaction[];
  message?: string;
}

const PAGE_SIZE = 50;

type BotTransactionPage = { transactions: BotTransaction[]; nextOffset: number; hasMore: boolean };

const NO_TRANSACTIONS: BotTransaction[] = [];

// Flattened and sorted oldest-first (kept stable between renders by `select`).
const flattenBotTransactions = (data: InfiniteData<BotTransactionPage>) =>
  data.pages
    .flatMap((page) => page.transactions)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

// Sats sent/received to other Telegram users via the bot, paginated
// newest page first via offset/limit, sorted oldest-first once flattened.
export const botTransactionsOptions = (userId: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.botTransactions(userId),
    queryFn: async ({ pageParam }): Promise<BotTransactionPage> => {
      let data: BotTransactionsResponse;
      try {
        data = await fetchy.get<BotTransactionsResponse>(
          `/transaction/bot-history?limit=${PAGE_SIZE}&offset=${pageParam}`
        );
      } catch (error) {
        // No bot transactions for this user.
        if (error instanceof FetchyError && error.status === 404) {
          return { transactions: [], nextOffset: pageParam, hasMore: false };
        }
        throw error;
      }

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
    staleTime: 1000 * 60 * 5,
    select: flattenBotTransactions,
  });

export function useBotTransactionHistory({ enabled = true }: { enabled?: boolean } = {}) {
  const session = useSession();
  const isAuthed = session.status === "authenticated";
  const userId = session.user?.id ?? "";

  const query = useInfiniteQuery({
    ...botTransactionsOptions(userId),
    enabled: enabled && isAuthed,
  });
  return { ...query, transactions: query.data ?? NO_TRANSACTIONS };
}
