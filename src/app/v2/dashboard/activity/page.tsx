"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ActivitySearchBar } from "@/components/v2/dashboard/activity/ActivitySearchBar";
import { ActivityTabs } from "@/components/v2/dashboard/activity/ActivityTabs";
import { ActivityGroup } from "@/components/v2/dashboard/activity/ActivityGroup";
import { MOCK_ACTIVITY } from "@/components/v2/dashboard/activity/mock-data";
import { ACTIVITY_TITLE, getActivityCategory, type ActivityCategory } from "@/lib/activity";
import { useStore } from "@/lib/store";

export default function ActivityV2Page() {
  const { balanceVisible, toggleBalanceVisible } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("all");

  const groups = useMemo(() => {
    const filtered = MOCK_ACTIVITY.filter((item) => {
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
  }, [search, category]);

  return (
    <div className="flex w-full flex-col gap-5">
      <ActivitySearchBar
        value={search}
        onChange={setSearch}
        visible={balanceVisible}
        onToggleVisible={toggleBalanceVisible}
      />

      <ActivityTabs value={category} onChange={setCategory} />

      {groups.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-[#64748b]">No activity found.</p>
      ) : (
        groups.map(([dayKey, items]) => (
          <ActivityGroup key={dayKey} date={items[0].timestamp} items={items} visible={balanceVisible} />
        ))
      )}
    </div>
  );
}
