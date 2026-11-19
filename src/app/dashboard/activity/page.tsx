"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { format } from "date-fns";
import { ActivitySearchBar } from "@/components/dashboard/activity/ActivitySearchBar";
import { ActivityTabs } from "@/components/dashboard/activity/ActivityTabs";
import { ActivityGroup } from "@/components/dashboard/activity/ActivityGroup";
import { ActivitySkeleton } from "@/components/dashboard/activity/ActivitySkeleton";
import { useTransactionHistory } from "@/hooks/query/useTransactionHistory";
import { useBotTransactionHistory } from "@/hooks/query/useBotTransactionHistory";
import {
  ACTIVITY_TITLE,
  getActivityCategory,
  mapBotTransactionToActivityItem,
  mapDcaTransactionToActivityItem,
  mapSellOrderToActivityItem,
  withoutSalePayments,
  type ActivityCategory,
} from "@/lib/activity";
import { useBalanceVisible } from "@/hooks/useBalanceVisible";

// Tipjar/faucet/gift and tasks have no backend endpoint yet.
const COMING_SOON_CATEGORIES: ActivityCategory[] = ["tasks"];

export default function ActivityPage() {
  const { visible: balanceVisible, toggle: toggleBalanceVisible } = useBalanceVisible();
  const [search, setSearch] = useState("");
  // The input updates on every key press; the (possibly long) list re-filters
  // with the deferred value, so typing never waits on it.
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState<ActivityCategory>("all");

  // Plan charges show on Plans, one-time buys and sales on Transactions: all
  // come from the member's history
  const showDca = category !== "tasks";
  const showBotHistory = category === "all" || category === "transactions";

  // Only fetch the sources the current tab actually shows.
  const dca = useTransactionHistory({ enabled: showDca });
  const botHistory = useBotTransactionHistory({ enabled: showBotHistory });

  const activity = useMemo(
    () => [
      ...dca.transactions.map(mapDcaTransactionToActivityItem),
      ...dca.sales.map(mapSellOrderToActivityItem),
      // A purchase's sats arrive as a bot transfer too: the backend marks
      // that transfer, so the purchase shows once. A sale's sats leave as a
      // bot payment: matched to the listed sale, so it shows once too
      ...withoutSalePayments(
        botHistory.transactions.filter((tx) => !tx.purchase_settlement),
        dca.sales
      ).map(mapBotTransactionToActivityItem),
    ],
    [dca.transactions, dca.sales, botHistory.transactions]
  );

  const dcaLoading = showDca && dca.isLoading;
  const botLoading = showBotHistory && botHistory.isLoading;
  const stillLoading = dcaLoading || botLoading;
  const dcaFailed = showDca && dca.isError;
  const botFailed = showBotHistory && botHistory.isError;
  const isError = dcaFailed || botFailed;
  // Names the source(s) that failed, for the notice shown above whatever
  // activity did load.
  const failedLabel =
    dcaFailed && botFailed ? "activity" : dcaFailed ? "purchases and sales" : "transfers";
  const refetch = () => {
    if (showDca && dca.isError) dca.refetch();
    if (showBotHistory && botHistory.isError) botHistory.refetch();
  };
  const hasNextPage = (showDca && dca.hasNextPage) || (showBotHistory && botHistory.hasNextPage);
  const isFetchingNextPage =
    (showDca && dca.isFetchingNextPage) || (showBotHistory && botHistory.isFetchingNextPage);
  const fetchNextPage = () => {
    if (showDca && dca.hasNextPage) dca.fetchNextPage();
    if (showBotHistory && botHistory.hasNextPage) botHistory.fetchNextPage();
  };

  const comingSoon = COMING_SOON_CATEGORIES.includes(category);

  const groups = useMemo(() => {
    if (comingSoon) return [];

    const filtered = activity.filter((item) => {
      const itemCategory = getActivityCategory(item.type);
      if (category !== "all" && itemCategory !== category) {
        return false;
      }
      if (!deferredSearch.trim()) return true;

      const query = deferredSearch.trim().toLowerCase();
      return (
        ACTIVITY_TITLE[item.type].toLowerCase().includes(query) ||
        item.counterparty?.toLowerCase().includes(query) ||
        item.detailLabel?.toLowerCase().includes(query)
      );
    });

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const byDay = new Map<string, typeof sorted>();
    for (const item of sorted) {
      const dayKey = format(new Date(item.timestamp), "yyyy-MM-dd");
      const bucket = byDay.get(dayKey);
      if (bucket) bucket.push(item);
      else byDay.set(dayKey, [item]);
    }

    return Array.from(byDay.entries());
  }, [activity, comingSoon, deferredSearch, category]);

  // Show whatever has loaded: a slow or failing source (the bot API can take
  // its full 10s timeout) must not hide purchases that are already here.
  const isLoading = stillLoading && groups.length === 0;

  return (
    <div className="flex w-full flex-col gap-5">
      <ActivitySearchBar
        value={search}
        onChange={setSearch}
        visible={balanceVisible}
        onToggleVisible={toggleBalanceVisible}
      />

      <ActivityTabs value={category} onChange={setCategory} />

      {isLoading ? (
        <ActivitySkeleton />
      ) : comingSoon ? (
        <p className="py-8 text-center text-[14px] text-[#64748b]">Coming soon.</p>
      ) : isError && groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <p className="text-center text-[14px] text-[#64748b]">Couldn&apos;t load activity.</p>
          <button
            onClick={refetch}
            className="cursor-pointer text-[14px] font-semibold text-[#fa7119]"
          >
            Try again
          </button>
        </div>
      ) : groups.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-[#64748b]">No activity found.</p>
      ) : (
        <>
          {isError && (
            <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[#fef2f2] px-4 py-3 dark:bg-[#2a1515]">
              <p className="text-[13px] text-[#b91c1c] dark:text-[#fca5a5]">
                Couldn&apos;t load {failedLabel}. Showing what loaded.
              </p>
              <button
                onClick={refetch}
                className="shrink-0 cursor-pointer text-[13px] font-semibold text-[#fa7119]"
              >
                Try again
              </button>
            </div>
          )}
          {stillLoading && (
            <p className="text-center text-[13px] text-[#64748b]">
              Loading {dcaLoading ? "purchases" : "transfers"}…
            </p>
          )}

          {groups.map(([dayKey, items]) => (
            <ActivityGroup
              key={dayKey}
              date={items[0].timestamp}
              items={items}
              visible={balanceVisible}
            />
          ))}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="cursor-pointer py-3 text-center text-[14px] font-semibold text-[#fa7119] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
