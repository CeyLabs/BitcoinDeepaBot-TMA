"use client";

import { useMemo, useState } from "react";
import { GiftFilterTabs, type GiftFilter } from "@/components/dashboard/plans/GiftFilterTabs";
import { GiftListCard } from "@/components/dashboard/plans/GiftListCard";
import type { ActivityItem } from "@/lib/types";

export interface ManageGiftsSectionProps {
  items: ActivityItem[];
  visible: boolean;
}

export function ManageGiftsSection({ items, visible }: ManageGiftsSectionProps) {
  const [filter, setFilter] = useState<GiftFilter>("all");

  const filtered = useMemo(() => {
    const sorted = [...items].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (filter === "all") return sorted;
    return sorted.filter(
      (item) => item.type === (filter === "sent" ? "gift_sent" : "gift_received")
    );
  }, [items, filter]);

  return (
    <div className="hidden w-full flex-col gap-3">
      <p className="text-[14px] leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
        Manage Gifts
      </p>

      <GiftFilterTabs value={filter} onChange={setFilter} />

      <GiftListCard items={filtered} visible={visible} />
    </div>
  );
}
