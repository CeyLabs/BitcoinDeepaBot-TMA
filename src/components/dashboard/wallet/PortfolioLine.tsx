"use client";

// chart.js is ~115 KB, so it lives in its own chunk that PortfolioChart loads
// with next/dynamic instead of shipping it in the initial bundle.
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default Line;
