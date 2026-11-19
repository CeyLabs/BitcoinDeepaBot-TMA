"use client";

import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { ActivityRow } from "@/components/dashboard/activity/ActivityRow";
import { fmtActivityGroupLabel } from "@/lib/formatters";
import type { ActivityEntry } from "@/lib/activity";

export interface ActivityGroupProps {
  date: string;
  items: ActivityEntry[];
  visible: boolean;
}

/** One day of activity: "Today" label over a card of expandable rows. */
export function ActivityGroup({ date, items, visible }: ActivityGroupProps) {
  return (
    <Section title={fmtActivityGroupLabel(date)} className="animate-rise">
      <Card className="p-1">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item} visible={visible} />
        ))}
      </Card>
    </Section>
  );
}
