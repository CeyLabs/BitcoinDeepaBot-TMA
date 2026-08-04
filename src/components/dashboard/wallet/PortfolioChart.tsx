"use client";

import { useMemo, useState, useTransition } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type TooltipItem,
} from "chart.js";
import { Card, Button } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";
import { fmtLkrCurrency, fmtPriceCompact } from "@/lib/formatters";
import { useTheme } from "@/app/context/theme";
import type { DcaTransaction } from "@/hooks/query/useTransactionHistory";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const PERIODS = ["1M", "3M", "6M", "1Y", "All"] as const;
type Period = (typeof PERIODS)[number];

const PERIOD_MONTHS: Record<Exclude<Period, "All">, number> = {
  "1M": 1,
  "3M": 3,
  "6M": 6,
  "1Y": 12,
};

interface ChartPoint {
  date: string;
  invested: number;
  bitcoin: number;
  portfolio: number;
}

function buildPoints(transactions: DcaTransaction[], currentBtcPrice: number): ChartPoint[] {
  let cumulativeSats = 0;
  let cumulativeInvested = 0;

  return transactions.map((tx) => {
    cumulativeSats += tx.satoshis_purchased;
    cumulativeInvested += tx.gross_amount;
    return {
      date: tx.created_at,
      invested: cumulativeInvested,
      bitcoin: tx.btc_price_at_purchase,
      portfolio: (cumulativeSats / 1e8) * currentBtcPrice,
    };
  });
}

function filterByPeriod(points: ChartPoint[], period: Period): ChartPoint[] {
  if (period === "All") return points;
  const months = PERIOD_MONTHS[period];
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const windowed = points.filter((p) => new Date(p.date) >= cutoff);
  return windowed.length >= 2 ? windowed : points;
}

export interface PortfolioChartProps {
  transactions: DcaTransaction[];
  currentBtcPrice: number;
}

export function PortfolioChart({ transactions, currentBtcPrice }: PortfolioChartProps) {
  const { isDark } = useTheme();
  // The pill highlight (`selectedPeriod`) updates immediately on click; the chart-driving
  // `chartPeriod` updates inside a transition so filtering/re-rendering the chart doesn't
  // delay the button's own paint.
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("3M");
  const [chartPeriod, setChartPeriod] = useState<Period>("3M");
  const [isPending, startTransition] = useTransition();

  const handlePeriodClick = (p: Period) => {
    setSelectedPeriod(p);
    startTransition(() => setChartPeriod(p));
  };

  const allPoints = useMemo(
    () => buildPoints(transactions, currentBtcPrice),
    [transactions, currentBtcPrice]
  );
  // With fewer than 2 points every period falls back to the same full set (see
  // filterByPeriod), so the switcher would just be dead buttons — hide it and
  // render the one timeframe that's actually meaningful.
  const showPeriodSwitcher = allPoints.length >= 2;
  const points = useMemo(
    () => (showPeriodSwitcher ? filterByPeriod(allPoints, chartPeriod) : allPoints),
    [allPoints, chartPeriod, showPeriodSwitcher]
  );

  const labels = points.map((p) =>
    new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
  );

  const avgBtcPrice =
    points.length > 0 ? points.reduce((sum, p) => sum + p.bitcoin, 0) / points.length : 0;

  const data = {
    labels,
    datasets: [
      {
        label: "Portfolio",
        data: points.map((p) => p.portfolio),
        yAxisID: "y",
        borderColor: "#218a54",
        backgroundColor: "rgba(37,167,97,0.15)",
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Invested",
        data: points.map((p) => p.invested),
        yAxisID: "y",
        borderColor: "#fa7119",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Bitcoin",
        data: points.map((p) => p.bitcoin),
        yAxisID: "y1",
        borderColor: "#0088ff",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: "Avg BTC Price",
        data: points.map(() => avgBtcPrice),
        yAxisID: "y1",
        borderColor: "#94a3b8",
        backgroundColor: "transparent",
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderWidth: 1.5,
        borderDash: [6, 4],
        spanGaps: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(27,32,39,0.95)",
        titleColor: "#fff",
        bodyColor: "#e2e8f0",
        cornerRadius: 8,
        callbacks: {
          label: (context: TooltipItem<"line">) =>
            `${context.dataset.label}: ${fmtLkrCurrency(Math.round(context.parsed.y ?? 0))}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 10 }, maxTicksLimit: 4 },
      },
      y: {
        position: "left" as const,
        grid: { color: isDark ? "#1f2a36" : "#e2e8f0" },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
          callback: (value: string | number) => fmtPriceCompact(Number(value)),
        },
      },
      y1: {
        position: "right" as const,
        grid: { display: false },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
          callback: (value: string | number) => fmtPriceCompact(Number(value)),
        },
      },
    },
    interaction: { mode: "index" as const, intersect: false },
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[14px] leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">
        Reward Portfolio Performance
      </p>

      <Card
        type="plain"
        className="block! w-full! rounded-[12px]! p-3!"
        style={
          {
            "--tgui--tertiary_bg_color": "var(--color-surface-primary)",
          } as React.CSSProperties
        }
      >
        {showPeriodSwitcher && (
          <div className="mb-3 flex items-center gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p}
                mode="gray"
                size="s"
                stretched
                onClick={() => handlePeriodClick(p)}
                style={
                  {
                    "--tgui--button--hovered-opacity": 0,
                    backgroundColor:
                      selectedPeriod === p ? "#1f2a36" : isDark ? "#1e293b" : "#eeeff3",
                    color: selectedPeriod === p ? "#fff" : isDark ? "#94a3b8" : "#64748b",
                  } as React.CSSProperties
                }
                // tgui's Button renders a square `:after` hover overlay that isn't clipped to
                // its own border-radius, so its corners poke out past the pill on mouse hover
                // unless the button itself clips overflow.
                className="overflow-hidden! rounded-[12px]!"
              >
                <span className="text-[12px]">{p}</span>
              </Button>
            ))}
          </div>
        )}

        {points.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-center">
            <p className="text-[14px] text-[#64748b]">
              No price data available
              <br />
              Start accruing membership rewards!
            </p>
          </div>
        ) : (
          <div className={cn("h-56 transition-opacity duration-150", isPending && "opacity-50")}>
            <Line data={data} options={options} />
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-1 w-2.5 rounded-full bg-[#218a54]" />
            <p className="text-[14px] leading-4 text-[#1b2027] dark:text-[#f1f5f9]">Portfolio</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1 w-2.5 rounded-full bg-[#0088ff]" />
            <p className="text-[14px] leading-4 text-[#1b2027] dark:text-[#f1f5f9]">Bitcoin</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1 w-2.5 rounded-full bg-[#fa7119]" />
            <p className="text-[14px] leading-4 text-[#1b2027] dark:text-[#f1f5f9]">Invested</p>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="h-0 w-2.5 border-t-2 border-dashed"
              style={{ borderColor: "#94a3b8" }}
            />
            <p className="text-[14px] leading-4 text-[#1b2027] dark:text-[#f1f5f9]">Avg BTC</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
