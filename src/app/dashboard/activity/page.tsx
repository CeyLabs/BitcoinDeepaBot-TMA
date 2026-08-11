"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ActivitySearchBar } from "@/components/dashboard/activity/ActivitySearchBar";
import { ActivityTabs } from "@/components/dashboard/activity/ActivityTabs";
import { ActivityGroup } from "@/components/dashboard/activity/ActivityGroup";
import { ActivitySkeleton } from "@/components/dashboard/activity/ActivitySkeleton";
import { useTransactionHistory, useBotTransactionHistory } from "@/hooks/query/useTransactionHistory";
import {
  ACTIVITY_TITLE,
  getActivityCategory,
  mapBotTransactionToActivityItem,
  mapDcaTransactionToActivityItem,
  type ActivityCategory,
} from "@/lib/activity";
import { useStore } from "@/lib/store";

export default function ActivityPage() {
  const { balanceVisible, toggleBalanceVisible } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("all");

  const dca = useTransactionHistory();
  const botHistory = useBotTransactionHistory();

  const activity = useMemo(
    () => [
      ...dca.transactions.map(mapDcaTransactionToActivityItem),
      ...botHistory.transactions.map(mapBotTransactionToActivityItem),
    ],
    [dca.transactions, botHistory.transactions]
  );

  const showDca = category === "all" || category === "plans";
  const showBotHistory = category === "all" || category === "transactions";
  const isLoading =
    (showDca && dca.isLoading) || (showBotHistory && botHistory.isLoading);
  const hasNextPage = (showDca && dca.hasNextPage) || (showBotHistory && botHistory.hasNextPage);
  const isFetchingNextPage = dca.isFetchingNextPage || botHistory.isFetchingNextPage;
  const fetchNextPage = () => {
    if (showDca && dca.hasNextPage) dca.fetchNextPage();
    if (showBotHistory && botHistory.hasNextPage) botHistory.fetchNextPage();
  };

  const groups = useMemo(() => {
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
  }, [activity, search, category]);

  return (
    <div className="flex w-full flex-col gap-5">
      <ActivitySearchBar
        value={search}
        onChange={setSearch}
        visible={balanceVisible}
        onToggleVisible={toggleBalanceVisible}
        disabled
      />

      <ActivityTabs value={category} onChange={setCategory} />

      {isLoading ? (
        <ActivitySkeleton />
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
