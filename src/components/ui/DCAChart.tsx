"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { formatLargeNumber } from "@/lib/formatters";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface DCAChartProps {
    authToken: string | null;
}

interface Transaction {
    created_at: string;
    satoshis_purchased: string;
    btc_price_at_purchase: string;
}

export function DCAChart({ authToken }: DCAChartProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);

            if (!authToken) return;

            try {
                setLoading(true);
                const res = await fetch("/api/transaction/list", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch transactions");
                const data = await res.json();
                const txList = Array.isArray(data) ? data : data.transactions.transactions || [];
                setTransactions(txList.slice(0, 10)); // Show last 10 transactions
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [authToken]);

    if (loading) {
        return (
            <div className="mb-6 rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Bitcoin Price Chart</h2>
                <div className="flex h-48 items-center justify-center">
                    <div className="text-gray-400">Loading chart...</div>
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="mb-6 rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Bitcoin Price Chart</h2>
                <div className="flex h-48 items-center justify-center">
                    <div className="text-center text-gray-400">
                        <p>No price data available</p>
                        <p className="text-sm">Make your first DCA purchase!</p>
                    </div>
                </div>
            </div>
        );
    }

    // Sort transactions by date and extract Bitcoin prices
    const sortedTx = [...transactions].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const labels = sortedTx.map((tx) => {
        const date = new Date(tx.created_at);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
        });
    });

    // Extract Bitcoin prices at purchase time
    const bitcoinPrices = sortedTx.map((tx) => {
        const priceStr = tx.btc_price_at_purchase.replace(/,/g, "");
        return Number(priceStr);
    });
    const data = {
        labels,
        datasets: [
            {
                label: "Bitcoin Price (LKR)",
                data: bitcoinPrices,
                fill: false,
                backgroundColor: "#fb923c",
                borderColor: "#fb923c",
                pointBackgroundColor: "#fb923c",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                tension: 0.4,
                borderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: "index" as const,
                intersect: false,
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                titleColor: "#fff",
                bodyColor: "#d1d5db",
                borderColor: "#374151",
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        const value = context.parsed.y;
                        return `BTC Price: LKR ${value.toLocaleString()}`;
                    },
                    afterLabel: function (context: any) {
                        const tx = sortedTx[context.dataIndex];
                        if (tx) {
                            const satsStr = tx.satoshis_purchased.replace(/,/g, "");
                            const sats = Number(satsStr);
                            return `Purchased: ${formatLargeNumber(sats)} sats`;
                        }
                        return "";
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#9ca3af",
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                grid: {
                    color: "rgba(55, 65, 81, 0.3)",
                },
                ticks: {
                    color: "#9ca3af",
                    font: {
                        size: 12,
                    },
                    callback: function (value: any) {
                        return `LKR ${formatLargeNumber(Number(value))}`;
                    },
                },
            },
        },
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
    };

    return (
        <div className="mb-6 rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">DCA Progress</h2>
                <div className="text-right">
                    <div className="text-sm text-gray-400">
                        {transactions.length} purchase{transactions.length !== 1 ? "s" : ""}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-48">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}
