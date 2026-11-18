"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Cell, CellChevron } from "@/components/ui/cell";
import { useSellOrders } from "@/hooks/query/useSell";
import { fmtActivityDateTime, fmtLkrExact, fmtSats } from "@/lib/formatters";
import { SELL_STATUS_BADGE } from "./sell-status";

export function RecentSales() {
  const { data: orders } = useSellOrders();
  const sales = (orders ?? []).filter((o) => o.status !== "QUOTED").slice(0, 10);
  if (sales.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[13px] leading-4 font-semibold tracking-wide text-[#64748b] uppercase dark:text-[#94a3b8]">
        Recent sales
      </h2>
      <ul className="bg-card divide-border flex flex-col divide-y overflow-hidden rounded-2xl">
        {sales.map((order) => {
          const badge = SELL_STATUS_BADGE[order.status];
          return (
            <li key={order.id}>
              <Link href={`/dashboard/sell/${order.id}`}>
                <Cell
                  className="hover:bg-tertiary [--cell-py:12px]"
                  subtitle={`${fmtSats(order.sats)} sats · ${fmtActivityDateTime(order.createdAt)}`}
                  after={
                    <span className="flex items-center">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      <CellChevron />
                    </span>
                  }
                >
                  {fmtLkrExact(order.amountLkr)}
                </Cell>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
