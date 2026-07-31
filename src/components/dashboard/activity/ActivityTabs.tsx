"use client";

import { Button } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";
import type { ActivityCategory } from "@/lib/activity";

const TABS: { value: ActivityCategory; label: string }[] = [
  { value: "all", label: "All Activities" },
  { value: "transactions", label: "Transactions" },
  { value: "tasks", label: "Tasks" },
  { value: "plans", label: "Plans" },
];

export interface ActivityTabsProps {
  value: ActivityCategory;
  onChange: (value: ActivityCategory) => void;
}

export function ActivityTabs({ value, onChange }: ActivityTabsProps) {
  return (
    <div className="w-full scrollbar-none overflow-x-auto">
      <div className="flex w-max items-center gap-2">
        {TABS.map((tab) => {
          const isActive = value === tab.value;

          return (
            <Button
              key={tab.value}
              mode="gray"
              size="s"
              onClick={() => onChange(tab.value)}
              style={{ "--tgui--button--hovered-opacity": 0 } as React.CSSProperties}
              className={cn(
                "rounded-[12px]! whitespace-nowrap!",
                isActive
                  ? "bg-surface-gift! text-white!"
                  : "bg-white! text-[#1b2027]! dark:bg-[#0B0F14]! dark:text-[#f1f5f9]!"
              )}
            >
              <span className="text-[14px] font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
