"use client";

import { useState } from "react";
import { getAuthTokenFromStorage } from "@/lib/auth";
import type { ApiTransaction } from "@/lib/types";
import { cn } from "@/lib/cn";
import LoadingPage from "@/components/LoadingPage";
import { formatDate, formatSatoshis } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";

export default function HistoryPage() {
    // Get auth token from localStorage
    const authToken = getAuthTokenFromStorage();

    const [selectedTransaction, setSelectedTransaction] = useState<ApiTransaction | null>(null);

    const {
        data: apiTransactions = [],
        error,
        isLoading,
        refetch,
    } = useQuery<ApiTransaction[]>({
        queryKey: ["transactions"],
        queryFn: async () => {
            const response = await fetch(`/api/transaction/list`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(
                    result.message || `Failed to fetch transactions: ${response.statusText}`
                );
            }
            // Handle different response structures
            if (Array.isArray(result)) {
                return result;
            }
            if (result.transactions) {
                return Array.isArray(result.transactions)
                    ? result.transactions
                    : result.transactions?.transactions || [];
            }
            return [];
        },
        enabled: !!authToken,
        staleTime: 1000 * 60 * 5,
    });

    const errorMessage = error instanceof Error ? error.message : null;

    const refreshTransactions = () => {
        refetch();
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
                  label: "Sats settled",
                  description: "Satoshis delivered to your wallet",
              }
            : {
                  color: "text-yellow-400",
                  bgColor: "bg-yellow-500/10",
                  icon: "⏳",
                  label: "Processing",
                  description: "Satoshis settlement being processed",
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

    // Show loading state
    if (isLoading) {
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
                        className="rounded-xl border border-gray-600 p-2 text-gray-400 transition-colors hover:border-orange-500 hover:text-orange-500"
                        title="Refresh transactions"
                    >
                        <svg
                            className="h-4 w-4 text-orange-400"
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
            {errorMessage && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-zinc-900/50 p-4 backdrop-blur-sm">
                    <h3 className="mb-2 font-medium text-red-400">Failed to Load Transactions</h3>
                    <p className="mb-4 text-sm text-gray-400">{errorMessage}</p>
                    <button
                        onClick={refreshTransactions}
                        className="rounded bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-red-800"
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
            {authToken && !errorMessage && (
                <div className="space-y-0">
                    {apiTransactions.length > 0 ? (
                        apiTransactions.map((transaction) => {
                            const statusInfo = getStatusInfo(transaction.status);
                            const settlementInfo = getSettlementInfo(transaction.settled);

                            return (
                                <div
                                    key={transaction.payhere_pay_id}
                                    className="group cursor-pointer border-b border-gray-800 py-3 transition-all duration-200 last:border-b-0 hover:border-gray-700 hover:bg-gray-800/30"
                                    onClick={() => setSelectedTransaction(transaction)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200",
                                                    statusInfo.bgColor,
                                                    statusInfo.borderColor,
                                                    "group-hover:scale-105"
                                                )}
                                            >
                                                <span className={cn("text-sm", statusInfo.color)}>
                                                    {statusInfo.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium transition-colors group-hover:text-white">
                                                    DCA Purchase
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(transaction.created_at)}
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-500 transition-colors duration-200 group-hover:text-orange-300">
                                                    Tap to view details
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                {transaction.satoshis_purchased && (
                                                    <p className="font-semibold text-orange-400 transition-colors group-hover:text-orange-300">
                                                        {Number(
                                                            transaction.satoshis_purchased
                                                        ).toLocaleString()}{" "}
                                                        <span className="text-sm font-medium text-orange-300">
                                                            sats
                                                        </span>
                                                    </p>
                                                )}
                                                <p
                                                    className={cn(
                                                        "text-xs font-medium",
                                                        statusInfo.color
                                                    )}
                                                >
                                                    {statusInfo.label}
                                                </p>
                                            </div>
                                            <div className="transform text-gray-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-orange-400">
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
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center">
                            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800">
                                <svg
                                    className="h-10 w-10 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-gray-300">
                                No Transactions Yet
                            </h3>
                            <p className="mx-auto mb-4 max-w-sm text-sm text-gray-500">
                                Your Bitcoin DCA purchases and membership transactions will appear
                                here once you start using the service.
                            </p>
                            <div className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/50 px-3 py-2 text-xs text-gray-600">
                                <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Transactions will be clickable for detailed view
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Transaction Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-gray-900 p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Transaction Details</h3>
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Status */}
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2",
                                        getStatusInfo(selectedTransaction.status).bgColor,
                                        getStatusInfo(selectedTransaction.status).borderColor
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "text-base",
                                            getStatusInfo(selectedTransaction.status).color
                                        )}
                                    >
                                        {getStatusInfo(selectedTransaction.status).icon}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">DCA Recurring Buy</p>
                                    {selectedTransaction.payhere_sub_id && (
                                        <span className="text-sm text-gray-500">(Membership)</span>
                                    )}
                                    <p
                                        className={cn(
                                            "text-sm font-medium",
                                            getStatusInfo(selectedTransaction.status).color
                                        )}
                                    >
                                        {getStatusInfo(selectedTransaction.status).label}
                                    </p>
                                </div>
                            </div>

                            {/* Purchase Details */}
                            {selectedTransaction.satoshis_purchased && (
                                <div className="rounded-xl bg-gray-800 p-4">
                                    <h4 className="mb-2 text-sm font-medium text-gray-300">
                                        Purchase Amount
                                    </h4>
                                    <p className="text-xl font-semibold text-orange-400">
                                        {Number(
                                            selectedTransaction.satoshis_purchased
                                        ).toLocaleString()}{" "}
                                        <span className="text-base font-medium text-orange-300">
                                            sats
                                        </span>
                                    </p>
                                    <p className="mt-1 font-mono text-sm text-gray-500">
                                        ₿{formatSatoshis(selectedTransaction.satoshis_purchased)}
                                    </p>
                                </div>
                            )}

                            {/* Timing */}
                            <div>
                                <h4 className="mb-2 text-sm font-medium text-gray-300">
                                    Transaction Time
                                </h4>
                                <p className="text-sm text-gray-400">
                                    {formatDate(selectedTransaction.created_at)} at{" "}
                                    {new Date(selectedTransaction.created_at).toLocaleTimeString()}
                                </p>
                            </div>

                            {/* Bitcoin Price */}
                            {selectedTransaction.btc_price_at_purchase && (
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-300">
                                        Bitcoin Price
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        රු.
                                        {Number(
                                            selectedTransaction.btc_price_at_purchase
                                        ).toLocaleString()}{" "}
                                        per BTC
                                    </p>
                                </div>
                            )}

                            {/* Settlement Status */}
                            {selectedTransaction.status === "SUCCESS" &&
                                (() => {
                                    const settlementInfo = getSettlementInfo(
                                        selectedTransaction.settled
                                    );
                                    if (settlementInfo) {
                                        return (
                                            <div>
                                                <h4 className="mb-2 text-sm font-medium text-gray-300">
                                                    Settlement Status
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            "text-sm",
                                                            settlementInfo.color
                                                        )}
                                                    >
                                                        {settlementInfo.icon}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "text-sm",
                                                            settlementInfo.color
                                                        )}
                                                    >
                                                        {settlementInfo.label}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {settlementInfo.description}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                            {/* Transaction ID */}
                            <div>
                                <h4 className="mb-2 text-sm font-medium text-gray-300">
                                    Transaction ID
                                </h4>
                                <div className="flex items-center gap-2">
                                    <p className="break-all font-mono text-xs text-gray-500">
                                        {selectedTransaction.payhere_pay_id}
                                    </p>
                                    <button
                                        className="rounded p-1 hover:bg-gray-700"
                                        title="Copy Transaction ID"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                selectedTransaction.payhere_pay_id
                                            );
                                        }}
                                    >
                                        <svg
                                            className="h-4 w-4 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <rect
                                                x="9"
                                                y="9"
                                                width="13"
                                                height="13"
                                                rx="2"
                                                ry="2"
                                                strokeWidth="2"
                                                stroke="currentColor"
                                            />
                                            <path
                                                d="M5 15V5a2 2 0 0 1 2-2h10"
                                                strokeWidth="2"
                                                stroke="currentColor"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
