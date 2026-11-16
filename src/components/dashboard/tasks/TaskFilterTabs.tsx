"use client";

import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { haptic } from "@/platform";

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
    <div className="w-full scrollbar-none overflow-x-auto">
      <div className="flex w-max items-center gap-2">
        {TABS.map((tab) => {
          const isActive = value === tab.value;

          return (
            <Button
              key={tab.value}
              variant="secondary"
              size="sm"
              onClick={() => {
                haptic.select();
                onChange(tab.value);
              }}
              className={cn(
                "rounded-[12px] whitespace-nowrap [--btn-hover-opacity:0]",
                isActive
                  ? "bg-surface-gift text-white"
                  : "bg-card text-[#1b2027] dark:text-[#f1f5f9]"
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
