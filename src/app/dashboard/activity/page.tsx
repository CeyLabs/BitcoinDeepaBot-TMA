"use client";

import { useMemo, useState } from "react";
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
  type ActivityCategory,
} from "@/lib/activity";
import { useStore } from "@/lib/store";

// Tipjar/faucet/gift and tasks have no backend endpoint yet.
const COMING_SOON_CATEGORIES: ActivityCategory[] = ["tasks"];

export default function ActivityPage() {
  const { balanceVisible, toggleBalanceVisible } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("all");

  const showDca = category === "all" || category === "plans";
  const showBotHistory = category === "all" || category === "transactions";

  // Only fetch the sources the current tab actually shows.
  const dca = useTransactionHistory({ enabled: showDca });
  const botHistory = useBotTransactionHistory({ enabled: showBotHistory });

  const activity = useMemo(
    () => [
      ...dca.transactions.map(mapDcaTransactionToActivityItem),
      ...botHistory.transactions.map(mapBotTransactionToActivityItem),
    ],
    [dca.transactions, botHistory.transactions]
  );

  const isLoading = (showDca && dca.isLoading) || (showBotHistory && botHistory.isLoading);
  const isError = (showDca && dca.isError) || (showBotHistory && botHistory.isError);
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
      if (!search.trim()) return true;

      const query = search.trim().toLowerCase();
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
  }, [activity, comingSoon, search, category]);

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
              className="py-3 text-center text-[14px] font-semibold text-[#fa7119] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
