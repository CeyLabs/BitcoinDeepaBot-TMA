"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ActivitySearchBar } from "@/components/v2/dashboard/activity/ActivitySearchBar";
import { ActivityTabs } from "@/components/v2/dashboard/activity/ActivityTabs";
import { ActivityGroup } from "@/components/v2/dashboard/activity/ActivityGroup";
import { useTransactionHistory } from "@/hooks/query/useTransactionHistory";
import {
  ACTIVITY_TITLE,
  getActivityCategory,
  mapDcaTransactionToActivityItem,
  type ActivityCategory,
} from "@/lib/activity";
import { useStore } from "@/lib/store";

// Only membership rewards (DCA purchases) are backed by real data today —
// sent/received/tipjar/faucet/gift and tasks have no backend endpoint yet.
const COMING_SOON_CATEGORIES: ActivityCategory[] = ["transactions", "tasks"];

export default function ActivityV2Page() {
  const { balanceVisible, toggleBalanceVisible } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("all");

  const { data: transactions } = useTransactionHistory();
  const activity = useMemo(
    () => (transactions ?? []).map(mapDcaTransactionToActivityItem),
    [transactions]
  );

  const comingSoon = COMING_SOON_CATEGORIES.includes(category);

  const groups = useMemo(() => {
    if (comingSoon) return [];

    const filtered = activity.filter((item) => {
      if (category !== "all" && getActivityCategory(item.type) !== category) return false;
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

      {comingSoon ? (
        <p className="py-8 text-center text-[14px] text-[#64748b]">Coming soon.</p>
      ) : groups.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-[#64748b]">No activity found.</p>
      ) : (
        groups.map(([dayKey, items]) => (
          <ActivityGroup key={dayKey} date={items[0].timestamp} items={items} visible={balanceVisible} />
        ))
      )}
    </div>
  );
}
