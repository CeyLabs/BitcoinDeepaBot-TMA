"use client";

import { Fragment } from "react";
import { ActivityRow } from "@/components/dashboard/activity/ActivityRow";
import { fmtActivityGroupLabel } from "@/lib/formatters";
import type { ActivityItem } from "@/lib/types";

export interface ActivityGroupProps {
  date: string;
  items: ActivityItem[];
  visible: boolean;
}

export function ActivityGroup({ date, items, visible }: ActivityGroupProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-sm font-bold leading-4 text-[#475569] dark:text-[#94A3B8]">
        {fmtActivityGroupLabel(date)}
      </p>

      <div className="w-full overflow-hidden rounded-[12px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:bg-[#0B0F14]">
        {items.map((item, i) => (
          <Fragment key={item.id}>
            {i > 0 && <div className="h-px bg-[#e2e8f0] dark:bg-[#334155]" />}
            <ActivityRow item={item} visible={visible} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
