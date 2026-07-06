"use client";

import { Card } from "@telegram-apps/telegram-ui";
import { fmtLkr, fmtSatsCompact, maskDigits } from "@/lib/formatters";

// Matches mock-wallet-data.ts's avg_btc_price so figures stay consistent across pages.
const BTC_PRICE_LKR = 29_500_000;

export interface TaskHeroCardStats {
  completedTotal: number;
  todayCompleted: number;
  todayTotal: number;
  totalEarnedSats: number;
  todayEarningsSats: number;
}

export interface TaskHeroCardProps {
  stats: TaskHeroCardStats;
  visible: boolean;
}

function btcLkrLabel(sats: number): string {
  const btc = sats / 1e8;
  const lkr = btc * BTC_PRICE_LKR;
  return `₿${btc.toFixed(5)} · LKR ${fmtLkr(lkr)}`;
}

export function TaskHeroCard({ stats, visible }: TaskHeroCardProps) {
  const mask = (v: string) => maskDigits(v, visible);

  return (
    <Card
      type="plain"
      className="relative overflow-hidden rounded-[20px]! p-0! shadow-none!"
      style={{ "--tgui--tertiary_bg_color": "transparent" } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B7DF5] via-[#2A5AE0] to-[#1B2F8C]" />

      <div className="relative flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <p className="text-[18px] font-bold leading-5 text-white">Your Tasks Earnings</p>
          <p className="text-[13px] leading-4 text-white/70">Complete Daily Tasks to earn more</p>
        </div>

        <div className="flex items-stretch">
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-[12px] leading-4 text-white/70">Task Completed</p>
            <p className="text-[16px] font-semibold leading-5 text-white">
              {mask(`${stats.completedTotal}`)}
            </p>
          </div>
          <div className="w-px self-stretch bg-white/25" />
          <div className="flex flex-1 flex-col items-end gap-1">
            <p className="text-[12px] leading-4 text-white/70">Today&apos;s Tasks</p>
            <p className="text-[16px] font-semibold leading-5 text-white">
              {mask(`${stats.todayCompleted}/${stats.todayTotal}`)} completed
            </p>
          </div>
        </div>

        <div className="flex rounded-[12px] bg-white/15 p-3">
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-[12px] leading-4 text-white/70">Total Earned</p>
            <p className="text-[16px] font-bold leading-4 text-white">
              {mask(`${fmtSatsCompact(stats.totalEarnedSats)} sats`)}
            </p>
            <p className="text-[12px] leading-4 text-white/70">
              {mask(btcLkrLabel(stats.totalEarnedSats))}
            </p>
          </div>
          <div className="w-px self-stretch bg-white/25" />
          <div className="flex flex-1 flex-col items-end gap-1">
            <p className="text-[12px] leading-4 text-white/70">Todays Earnings</p>
            <p className="text-[16px] font-bold leading-4 text-white">
              {mask(`${fmtSatsCompact(stats.todayEarningsSats)} sats`)}
            </p>
            <p className="text-[12px] leading-4 text-white/70">
              {mask(btcLkrLabel(stats.todayEarningsSats))}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
