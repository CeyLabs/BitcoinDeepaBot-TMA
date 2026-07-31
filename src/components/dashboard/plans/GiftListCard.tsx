"use client";

import { Fragment } from "react";
import { GiftRow } from "@/components/dashboard/plans/GiftRow";
import type { ActivityItem } from "@/lib/types";

export interface GiftListCardProps {
  items: ActivityItem[];
  visible: boolean;
}

export function GiftListCard({ items, visible }: GiftListCardProps) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-[14px] text-[#64748b]">No gifts found.</p>;
  }

  return (
    <div className="w-full overflow-hidden rounded-[12px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:bg-[#0B0F14]">
      {items.map((item, i) => (
        <Fragment key={item.id}>
          {i > 0 && <div className="h-px bg-[#e2e8f0] dark:bg-[#334155]" />}
          <GiftRow item={item} visible={visible} />
        </Fragment>
      ))}
    </div>
  );
}
