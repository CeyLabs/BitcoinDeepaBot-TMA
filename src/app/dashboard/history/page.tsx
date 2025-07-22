"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthTokenFromStorage } from "@/lib/auth";
import type { ApiTransaction } from "@/lib/types";
import { cn } from "@/lib/cn";
import LoadingPage from "@/components/LoadingPage";

export default function HistoryPage() {
    // Get auth token from localStorage
    const authToken = getAuthTokenFromStorage();

    // API transaction state
    const [apiTransactions, setApiTransactions] = useState<ApiTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [totalTransactions, setTotalTransactions] = useState(0);

    const ITEMS_PER_PAGE = 10;

    // Fetch transactions from API
    const fetchTransactions = useCallback(
        async (page: number = 1, append: boolean = false) => {
            if (!authToken) {
                setLoading(false);
                return;
            }

            try {
                if (append) {
                    setLoadingMore(true);
                } else {
                    setLoading(true);
                    setCurrentPage(1);
                    setApiTransactions([]);
                    setHasMorePages(true);
                }
                setError(null);

                const response = await fetch(
                    `/api/transaction/list?page=${page}&limit=${ITEMS_PER_PAGE}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || `Failed to fetch transactions: ${response.statusText}`
                    );
                }

                const transactions = Array.isArray(result.transactions)
                    ? result.transactions
                    : result.transactions?.transactions || [];

                // Extract pagination info from the nested transactions object
                const transactionData = result.transactions;
                const totalCount = transactionData?.total_count || transactions.length;
                const currentPageFromAPI = transactionData?.current_page || page;
                const totalPages = transactionData?.total_pages || Math.ceil(totalCount / ITEMS_PER_PAGE);
                const hasMore = transactionData?.has_more || false;

                setTotalTransactions(totalCount);
                setCurrentPage(currentPageFromAPI);
                setHasMorePages(hasMore);

                if (append) {
                    setApiTransactions((prev) => [...prev, ...transactions]);
                } else {
                    setApiTransactions(transactions);
                }
            } catch (err) {
                console.error("❌ Error fetching transactions:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch transactions");
                if (!append) {
                    setApiTransactions([]);
                }
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [authToken, ITEMS_PER_PAGE]
    );

    // Fetch transactions when component mounts and auth token is available
    useEffect(() => {
        if (authToken) {
            fetchTransactions();
        } else {
            setLoading(false);
        }
    }, [authToken, fetchTransactions]);

    // Load more transactions
    const loadMoreTransactions = () => {
        if (!loadingMore && hasMorePages) {
            fetchTransactions(currentPage + 1, true);
        }
    };

    // Refresh transactions (reset to first page)
    const refreshTransactions = () => {
        fetchTransactions(1, false);
    };

    // Get settlement status info
    const getSettlementInfo = (settled?: boolean) => {
        if (settled === undefined) {
            return null; // Don't show anything if settled status is not available
        }
        
        return settled
            ? {
                  color: "text-green-400",
                  bgColor: "bg-green-500/10",
                  icon: "✓",
                  label: "Sats Sent",
                  description: "Satoshis delivered to your wallet"
              }
            : {
                  color: "text-yellow-400",
                  bgColor: "bg-yellow-500/10",
                  icon: "⏳",
                  label: "Processing",
                  description: "Satoshis being processed"
              };
    };

    const getStatusInfo = (status: ApiTransaction["status"]) => {
        switch (status) {
            case "SUCCESS":
                return {
                    color: "text-green-400",
                    bgColor: "bg-green-500/20",
                    borderColor: "border-green-500",
                    icon: "✓",
                    label: "Success",
                };
            case "PENDING":
                return {
                    color: "text-yellow-400",
                    bgColor: "bg-yellow-500/20",
                    borderColor: "border-yellow-500",
                    icon: "⏳",
                    label: "Pending",
                };
            case "FAILED":
                return {
                    color: "text-red-400",
                    bgColor: "bg-red-500/20",
                    borderColor: "border-red-500",
                    icon: "✗",
                    label: "Failed",
                };
            case "CANCELLED":
                return {
                    color: "text-gray-400",
                    bgColor: "bg-gray-500/20",
                    borderColor: "border-gray-500",
                    icon: "⊘",
                    label: "Cancelled",
                };
            case "CHARGEBACK":
                return {
                    color: "text-orange-400",
                    bgColor: "bg-orange-500/20",
                    borderColor: "border-orange-500",
                    icon: "↶",
                    label: "Chargeback",
                };
            default:
                return {
                    color: "text-gray-400",
                    bgColor: "bg-gray-500/20",
                    borderColor: "border-gray-500",
                    icon: "?",
                    label: "Unknown",
                };
        }
    };

    // Format satoshis to BTC
    const formatSatoshis = (satoshis: number) => {
        return (satoshis / 100000000).toFixed(8);
    };

    // Show loading state
    if (loading) {
        return <LoadingPage />;
    }

    return (
        <main className="pb-20">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold">Transaction History</h1>
                {authToken && (
                    <button
                        onClick={refreshTransactions}
                        className="rounded-lg border border-gray-600 p-2 text-gray-400 transition-colors hover:border-orange-500 hover:text-orange-500"
                        title="Refresh transactions"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <h3 className="mb-2 font-medium text-red-400">Failed to Load Transactions</h3>
                    <p className="mb-4 text-sm text-gray-400">{error}</p>
                    <button
                        onClick={refreshTransactions}
                        className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* No Auth Token */}
            {!authToken && (
                <div className="py-8 text-center text-gray-400">
                    <p className="mb-2">Please authenticate to view transactions</p>
                    <p className="text-sm text-gray-500">
                        Your transaction history will appear here once logged in
                    </p>
                </div>
            )}

            {/* Transactions List */}
            {authToken && !error && (
                <div className="space-y-0">
                    {apiTransactions.length > 0 ? (
                        apiTransactions.map((transaction) => {
                            const statusInfo = getStatusInfo(transaction.status);
                            const settlementInfo = getSettlementInfo(transaction.settled);

                            return (
                                <div
                                    key={transaction.payhere_pay_id}
                                    className="flex items-center justify-between border-b border-gray-800 py-4 last:border-b-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                                                statusInfo.bgColor,
                                                statusInfo.borderColor
                                            )}
                                        >
                                            <span className={cn("text-sm", statusInfo.color)}>
                                                {statusInfo.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                SATS Purchase
                                                {transaction.payhere_sub_id && (
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        (Auto-stack)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(
                                                    transaction.created_at
                                                ).toLocaleDateString()}{" "}
                                                at{" "}
                                                {new Date(
                                                    transaction.created_at
                                                ).toLocaleTimeString()}
                                            </p>
                                            {transaction.btc_price_at_purchase && (
                                                <p className="text-xs text-gray-500">
                                                    BTC Purchased AT:{" "}
                                                    {transaction.btc_price_at_purchase.toLocaleString()}
                                                </p>
                                            )}
                                            {settlementInfo && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span 
                                                        className={cn("text-xs", settlementInfo.color)}
                                                        title={settlementInfo.description}
                                                    >
                                                        {settlementInfo.icon}
                                                    </span>
                                                    <span className={cn("text-xs", settlementInfo.color)}>
                                                        {settlementInfo.label}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {transaction.satoshis_purchased && (
                                            <p className="font-semibold text-orange-400">
                                                {transaction.satoshis_purchased}
                                            </p>
                                        )}
                                        {transaction.satoshis_purchased && (
                                            <p className="font-mono text-xs text-gray-500">
                                                ₿ {formatSatoshis(transaction.satoshis_purchased)}
                                            </p>
                                        )}
                                        <p className={cn("text-xs font-medium", statusInfo.color)}>
                                            {statusInfo.label}
                                        </p>
                                        {settlementInfo && (
                                            <p className={cn("text-xs font-medium mt-1", settlementInfo.color)}>
                                                {settlementInfo.label}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
                                <svg
                                    className="h-8 w-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-gray-400">
                                No Transactions Yet
                            </h3>
                            <p className="text-sm text-gray-500">
                                Your Bitcoin purchases and subscription transactions will appear
                                here
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Load More Button */}
            {authToken && !error && apiTransactions.length > 0 && hasMorePages && (
                <div className="mt-6 text-center">
                    <button
                        onClick={loadMoreTransactions}
                        disabled={loadingMore}
                        className="rounded-lg border border-orange-500 bg-orange-500/10 px-6 py-3 font-medium text-orange-400 transition-colors hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loadingMore ? (
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Loading more...
                            </div>
                        ) : (
                            `Load More (${totalTransactions - apiTransactions.length} remaining)`
                        )}
                    </button>
                </div>
            )}

            {/* Transaction Summary */}
            {authToken && !error && apiTransactions.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    Showing {apiTransactions.length} of {totalTransactions} transactions
                </div>
            )}
        </main>
    );
}
