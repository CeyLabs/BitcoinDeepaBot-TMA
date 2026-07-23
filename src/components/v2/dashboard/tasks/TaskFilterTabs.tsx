"use client";

import { Button } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";

export type TaskFilter = "all" | "daily" | "one_time";

const TABS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "daily", label: "Daily" },
  { value: "one_time", label: "One time" },
];

export interface TaskFilterTabsProps {
  value: TaskFilter;
  onChange: (value: TaskFilter) => void;
}

export function TaskFilterTabs({ value, onChange }: TaskFilterTabsProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-none">
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
