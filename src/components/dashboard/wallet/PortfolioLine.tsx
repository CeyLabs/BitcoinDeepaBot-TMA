"use client";

// chart.js is ~115 KB, so it lives in its own chunk that PortfolioChart loads
// with next/dynamic instead of shipping it in the initial bundle.
import { useEffect, useRef } from "react";
import {
  Chart,
  CategoryScale,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface PortfolioLineProps {
  data: ChartData<"line">;
  options: ChartOptions<"line">;
}

/** A chart.js line chart on a canvas: created on mount, updated in place, destroyed on unmount. */
export default function PortfolioLine({ data, options }: PortfolioLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"line"> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const chart = new Chart(canvasRef.current, { type: "line", data, options });
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
    // Created once; later changes go through the update effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data = data;
    chart.options = options;
    // No animation: a theme or data change just redraws.
    chart.update("none");
  }, [data, options]);

  return <canvas ref={canvasRef} role="img" aria-label="Reward portfolio performance chart" />;
}
