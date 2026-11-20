"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CellChevron } from "@/components/ui/cell";
import { Emoji } from "@/components/ui/emoji";
import { List, ListRow, Section } from "@/components/ui/section";
import { useSellOrders } from "@/hooks/query/useSell";
import { fmtActivityDateTime, fmtLkrExact, fmtSats } from "@/lib/formatters";
import { haptic } from "@/platform";
import { SELL_STATUS_BADGE } from "./sell-status";

export function RecentSales() {
  const router = useRouter();
  const { data: orders } = useSellOrders();
  const sales = (orders ?? []).filter((o) => o.status !== "QUOTED").slice(0, 10);
  if (sales.length === 0) return null;

  return (
    <Section title="Recent sales">
      <List className="bg-card shadow-card">
        {sales.map((order) => {
          const badge = SELL_STATUS_BADGE[order.status];
          return (
            <ListRow
              key={order.id}
              icon={<Emoji src="/emoji/sent.webp" size={26} />}
              className="[&>span:first-child]:bg-chip"
              title={<span className="num">{fmtLkrExact(order.amountLkr)}</span>}
              subtitle={`${fmtSats(order.sats)} sats · ${fmtActivityDateTime(order.createdAt)}`}
              after={
                <span className="flex items-center gap-1">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <CellChevron />
                </span>
              }
              onClick={() => {
                haptic.select();
                router.push(`/dashboard/sell/${order.id}`);
              }}
            />
          );
        })}
      </List>
    </Section>
  );
}
