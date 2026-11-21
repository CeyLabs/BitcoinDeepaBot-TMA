"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import { cn } from "cn";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Segmented } from "@/components/ui/segmented";
import { fmtLkrCurrency, fmtPriceCompact } from "@/lib/formatters";
import { useTheme } from "@/app/context/theme";
import type { DcaTransaction } from "@/hooks/query/useTransactionHistory";

// chart.js (~115 KB) lives in its own chunk, loaded after the page is interactive.
const Line = dynamic(() => import("./PortfolioLine"), {
  ssr: false,
  loading: () => <span className="skeleton block h-full w-full rounded-lg" />,
});

const RANGES = [
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "All", label: "All" },
] as const;
type Range = (typeof RANGES)[number]["value"];
const RANGE_MONTHS: Record<Exclude<Range, "All">, number> = { "3M": 3, "1Y": 12 };

interface ChartPoint {
  date: string;
  /** `date` as epoch ms: the x position on the time axis. */
  t: number;
  invested: number;
  bitcoin: number;
  portfolio: number;
}

function buildPoints(transactions: DcaTransaction[], currentBtcPrice: number): ChartPoint[] {
  let cumulativeSats = 0;
  let cumulativeInvested = 0;

  // Only purchases that actually bought BTC; failed/pending/cancelled
  // attempts have no price and would drop the Bitcoin line to 0.
  const purchases = transactions.filter(
    (tx) => tx.status.toUpperCase() === "SUCCESS" && tx.satoshis_purchased > 0
  );

  return purchases.map((tx) => {
    cumulativeSats += tx.satoshis_purchased;
    // Same basis as the "You invested" card: excluding fees
    cumulativeInvested += tx.net_amount || tx.gross_amount;
    return {
      date: tx.created_at,
      t: new Date(tx.created_at).getTime(),
      invested: cumulativeInvested,
      bitcoin: tx.btc_price_at_purchase,
      portfolio: (cumulativeSats / 1e8) * currentBtcPrice,
    };
  });
}

/**
 * The x-axis window for a range: first to last buy inside it. Every range draws the same full
 * dataset and only moves this window, so switching ranges pans/zooms the lines in an animation
 * instead of swapping in a different set of points.
 */
function rangeWindow(points: ChartPoint[], range: Range): { min: number; max: number } | null {
  if (points.length === 0) return null;
  const max = points[points.length - 1].t;
  let first = points[0];
  if (range !== "All") {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - RANGE_MONTHS[range]);
    const windowed = points.filter((p) => p.t >= cutoff.getTime());
    // Too few buys in the window to draw a line: show everything instead.
    if (windowed.length >= 2) first = windowed[0];
  }
  return { min: first.t, max };
}

const fmtAxisDate = (t: number) =>
  new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export interface PortfolioChartProps {
  transactions: DcaTransaction[];
  currentBtcPrice: number;
}

export function PortfolioChart({ transactions, currentBtcPrice }: PortfolioChartProps) {
  const { isDark } = useTheme();
  const [range, setRange] = useState<Range>("All");

  const allPoints = useMemo(
    () => buildPoints(transactions, currentBtcPrice),
    [transactions, currentBtcPrice]
  );
  const points = allPoints;
  const xWindow = useMemo(() => rangeWindow(points, range), [points, range]);
  const last = points[points.length - 1];
  const isUp = !last || last.portfolio >= last.invested;

  const colors = useMemo(
    () => ({
      pl: isUp ? (isDark ? "#3dbe7a" : "#1e7b4f") : isDark ? "#f45a5a" : "#d63b3b",
      btc: isDark ? "#4da6ff" : "#0088ff",
      grid: isDark ? "#334155" : "#e2e8f0",
      tick: isDark ? "#94a3b8" : "#64748b",
    }),
    [isUp, isDark]
  );

  // Memoized so PortfolioLine only updates the chart when the data or theme
  // actually changes, not on every re-render of this card. Points are {x: time, y}
  // on a linear x axis, so buys are spaced by date and a range is just an x window.
  const data = useMemo<ChartData<"line">>(() => {
    return {
      datasets: [
        {
          label: "Portfolio",
          data: points.map((p) => ({ x: p.t, y: p.portfolio })),
          yAxisID: "y",
          borderColor: colors.pl,
          backgroundColor: (ctx) => {
            const { chart } = ctx;
            const area = chart.chartArea;
            if (!area) return "transparent";
            const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            g.addColorStop(0, `${colors.pl}4d`);
            g.addColorStop(1, `${colors.pl}00`);
            return g;
          },
          fill: true,
          tension: 0.35,
          pointRadius: (ctx) => (ctx.dataIndex === points.length - 1 ? 4.5 : 0),
          pointBackgroundColor: colors.pl,
          pointBorderColor: isDark ? "#1b2027" : "#fffffe",
          pointBorderWidth: 2,
          borderWidth: 2.6,
        },
        {
          label: "Invested",
          data: points.map((p) => ({ x: p.t, y: p.invested })),
          yAxisID: "y",
          borderColor: "#f8931a",
          backgroundColor: "transparent",
          borderDash: [4, 4],
          fill: false,
          tension: 0,
          pointRadius: 0,
          borderWidth: 1.8,
        },
        {
          label: "Bitcoin",
          data: points.map((p) => ({ x: p.t, y: p.bitcoin })),
          yAxisID: "y1",
          borderColor: colors.btc,
          backgroundColor: "transparent",
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 1.6,
        },
      ],
    };
  }, [points, colors, isDark]);

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          backgroundColor: "rgba(31,42,54,0.96)",
          titleColor: "#fff",
          bodyColor: "#e2e8f0",
          cornerRadius: 12,
          padding: 10,
          callbacks: {
            // The axis keeps "25 Jan" to fit; the tooltip says which year.
            title: (items: TooltipItem<"line">[]) => {
              const point = points[items[0]?.dataIndex ?? -1];
              return point
                ? new Date(point.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "";
            },
            label: (context: TooltipItem<"line">) =>
              `${context.dataset.label}: ${fmtLkrCurrency(Math.round(context.parsed.y ?? 0))}`,
          },
        },
      },
      scales: {
        x: {
          type: "linear" as const,
          min: xWindow?.min,
          max: xWindow?.max,
          grid: { display: false },
          border: { display: false },
          // Three dates: the window's start, middle and end, first and last kept inside the card.
          afterBuildTicks: (scale) => {
            const { min, max } = scale;
            scale.ticks = [min, (min + max) / 2, max].map((value) => ({ value }));
          },
          ticks: {
            color: colors.tick,
            font: { size: 12, weight: 600 },
            align: "inner" as const,
            maxRotation: 0,
            callback: (value: string | number) => fmtAxisDate(Number(value)),
          },
        },
        y: {
          position: "left" as const,
          grid: { color: colors.grid },
          border: { display: false },
          ticks: {
            color: colors.tick,
            font: { size: 12, weight: 600 },
            maxTicksLimit: 4,
            callback: (value: string | number) => fmtPriceCompact(Number(value)),
          },
        },
        y1: {
          position: "right" as const,
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: colors.tick,
            font: { size: 12, weight: 600 },
            maxTicksLimit: 4,
            callback: (value: string | number) => fmtPriceCompact(Number(value)),
          },
        },
      },
      interaction: { mode: "index" as const, intersect: false },
    }),
    [colors, points, xWindow]
  );

  return (
    <Section title="Reward portfolio performance">
      <Card className="p-4">
        <Segmented
          label="Chart range"
          options={RANGES}
          value={range}
          onChange={setRange}
          className="w-[168px]"
        />
        {points.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-1 text-center">
            <p className="font-bold">No rewards yet</p>
            <p className="text-ink3 text-[14px]">Your chart starts with your first reward.</p>
          </div>
        ) : (
          <div className="mt-2 h-52">
            <Line data={data} options={options} />
          </div>
        )}
        <div className="text-ink2 mt-2.5 flex flex-wrap gap-4 text-[12px]">
          <Legend className="h-[3px]" color={colors.pl} label="Portfolio" />
          <Legend
            className="h-0 border-t-2 border-dashed border-[#f8931a] bg-transparent"
            label="Invested"
          />
          <Legend className="h-[3px]" color={colors.btc} label="Bitcoin" />
        </div>
      </Card>
    </Section>
  );
}

function Legend({
  className,
  color,
  label,
}: {
  className?: string;
  color?: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i className={cn("inline-block w-3.5 rounded-sm", className)} style={{ background: color }} />
      {label}
    </span>
  );
}
