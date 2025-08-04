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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface DCAChartProps {
    authToken: string | null;
}

interface Transaction {
    created_at: string;
    satoshis_purchased: number;
    amount_lkr: number;
}

export function DCAChart({ authToken }: DCAChartProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            // Mock data for testing
            const mockTransactions: Transaction[] = [
                {
                    created_at: "2024-07-01T10:00:00Z",
                    satoshis_purchased: 50000,
                    amount_lkr: 5000,
                },
                {
                    created_at: "2024-07-05T10:00:00Z", 
                    satoshis_purchased: 75000,
                    amount_lkr: 7500,
                },
                {
                    created_at: "2024-07-10T10:00:00Z",
                    satoshis_purchased: 60000,
                    amount_lkr: 6000,
                },
                {
                    created_at: "2024-07-15T10:00:00Z",
                    satoshis_purchased: 80000,
                    amount_lkr: 8000,
                },
                {
                    created_at: "2024-07-20T10:00:00Z",
                    satoshis_purchased: 90000,
                    amount_lkr: 9000,
                },
                {
                    created_at: "2024-07-25T10:00:00Z",
                    satoshis_purchased: 70000,
                    amount_lkr: 7000,
                },
                {
                    created_at: "2024-07-30T10:00:00Z",
                    satoshis_purchased: 85000,
                    amount_lkr: 8500,
                },
            ];

            setLoading(true);
            // Simulate API delay
            setTimeout(() => {
                setTransactions(mockTransactions);
                setLoading(false);
            }, 1000);

            // Uncomment below for real API call
            /*
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
                const txList = Array.isArray(data) ? data : data.transactions || [];
                setTransactions(txList.slice(0, 10)); // Show last 10 transactions
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
            */
        };

        fetchTransactions();
    }, [authToken]);

    if (loading) {
        return (
            <div className="mb-6 rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">DCA Progress</h2>
                <div className="flex h-48 items-center justify-center">
                    <div className="text-gray-400">Loading chart...</div>
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="mb-6 rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">DCA Progress</h2>
                <div className="flex h-48 items-center justify-center">
                    <div className="text-center text-gray-400">
                        <p>No transactions found</p>
                        <p className="text-sm">Start your DCA journey!</p>
                    </div>
                </div>
            </div>
        );
    }

    // Sort transactions by date and calculate cumulative data
    const sortedTx = [...transactions].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const labels = sortedTx.map(tx => {
        const date = new Date(tx.created_at);
        return date.toLocaleDateString("en-GB", { 
            day: "2-digit", 
            month: "short" 
        });
    });

    let cumulativeSats = 0;
    const cumulativeData = sortedTx.map(tx => {
        cumulativeSats += tx.satoshis_purchased || 0;
        return cumulativeSats;
    });

    let cumulativeSpent = 0;
    const spentData = sortedTx.map(tx => {
        cumulativeSpent += tx.amount_lkr || 0;
        return cumulativeSpent;
    });

    const data = {
        labels,
        datasets: [
            {
                label: "Satoshis Accumulated",
                data: cumulativeData,
                fill: true,
                backgroundColor: "rgba(251, 146, 60, 0.1)",
                borderColor: "#fb923c",
                pointBackgroundColor: "#fb923c",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
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
                    label: function(context: any) {
                        const value = context.parsed.y;
                        return `${value.toLocaleString()} sats`;
                    },
                    afterLabel: function(context: any) {
                        const btc = (context.parsed.y / 100_000_000).toFixed(8);
                        const spent = spentData[context.dataIndex];
                        return [
                            `≈ ${btc} BTC`,
                            `Spent: LKR ${spent.toLocaleString()}`
                        ];
                    }
                }
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
                    callback: function(value: any) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + "M";
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(1) + "K";
                        }
                        return value.toLocaleString();
                    }
                },
            },
        },
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
    };

    const totalSats = cumulativeData[cumulativeData.length - 1] || 0;
    const totalSpent = spentData[spentData.length - 1] || 0;
    const avgPrice = totalSpent > 0 ? totalSpent / (totalSats / 100_000_000) : 0;

    return (
        <div className="mb-6 rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">DCA Progress</h2>
                <div className="text-right">
                    <div className="text-sm text-gray-400">
                        {transactions.length} purchase{transactions.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
            
            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-gray-900/50 p-3 text-center">
                    <div className="text-xs text-gray-400">Total Sats</div>
                    <div className="text-sm font-semibold text-orange-400">
                        {totalSats.toLocaleString()}
                    </div>
                </div>
                <div className="rounded-xl bg-gray-900/50 p-3 text-center">
                    <div className="text-xs text-gray-400">Total Spent</div>
                    <div className="text-sm font-semibold text-blue-400">
                        LKR {totalSpent.toLocaleString()}
                    </div>
                </div>
                <div className="rounded-xl bg-gray-900/50 p-3 text-center">
                    <div className="text-xs text-gray-400">Avg Price</div>
                    <div className="text-sm font-semibold text-green-400">
                        LKR {avgPrice.toFixed(0)}
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
