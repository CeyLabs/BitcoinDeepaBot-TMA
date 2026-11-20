"use client";

import { Chip, ChipRow } from "@/components/ui/chip";
import { haptic } from "@/platform";
import type { ActivityCategory } from "@/lib/activity";

const TABS: { value: ActivityCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "transactions", label: "Transactions" },
  { value: "plans", label: "Plans" },
  // "tasks" comes back with the Tasks page
];

export interface ActivityTabsProps {
  value: ActivityCategory;
  onChange: (value: ActivityCategory) => void;
}

/** Filter chips under the search field. */
export function ActivityTabs({ value, onChange }: ActivityTabsProps) {
  return (
    <ChipRow label="Filter activity" className="-mt-2">
      {TABS.map((tab) => (
        <Chip
          key={tab.value}
          active={value === tab.value}
          onClick={() => {
            haptic.select();
            onChange(tab.value);
          }}
        >
          {tab.label}
        </Chip>
      ))}
    </ChipRow>
  );
}
