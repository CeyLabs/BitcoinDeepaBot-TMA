"use client";

import { Button } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";

export type GiftFilter = "all" | "received" | "sent";

const TABS: { value: GiftFilter; label: string }[] = [
  { value: "all", label: "All Gifts" },
  { value: "received", label: "Received" },
  { value: "sent", label: "Sent" },
];

export interface GiftFilterTabsProps {
  value: GiftFilter;
  onChange: (value: GiftFilter) => void;
}

export function GiftFilterTabs({ value, onChange }: GiftFilterTabsProps) {
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
