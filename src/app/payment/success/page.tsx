"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@telegram-apps/telegram-ui";
import { useStore } from "@/lib/store";
import LoadingPage from "@/components/LoadingPage";
import { BiCheckCircle } from "react-icons/bi";
import { getAuthTokenFromStorage } from "@/lib/auth";
import { MdCancel } from "react-icons/md";
import { ApiTransaction } from "@/lib/types";

export default function PaymentSuccessPage() {
    const router = useRouter();
    const { setSubscription } = useStore();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactionData, setTransactionData] = useState<ApiTransaction | null>(null);

    // Get auth token
    const authToken = getAuthTokenFromStorage();

    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchTransactionData = async () => {
            try {
                setIsProcessing(true);

                if (!authToken) {
                    throw new Error("Authentication token not found");
                }

                // Fetch current transaction status
                const response = await fetch("/api/transaction/latest", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch transaction data");
                }

                // Parse transactions data
                const data = await response.json();

                // Check if transactions array exists and has items
                if (!data.transactions || data.transactions.length === 0) {
                    // If not found, keep polling
                    if (isMounted) {
                        pollingRef.current = setTimeout(fetchTransactionData, 1000);
                    }
                    return;
                }

                // Get the first transaction (most recent)
                const transaction = data.transactions[0];
                setTransactionData(transaction);

                // Update store if needed
                setSubscription({
                    active: transaction.status === "SUCCESS",
                    ...transaction,
                });

                // Verify transaction is successful
                if (transaction.status !== "SUCCESS") {
                    throw new Error("Payment was not successful. Please contact support.");
                }
                // Stop polling when data is found and successful
                setIsProcessing(false);
            } catch (error) {
                console.error("Error processing transaction:", error);
                setError(
                    error instanceof Error ? error.message : "Transaction verification failed"
                );
                setIsProcessing(false);
            }
        };

        // Start polling with 1 second delay
        pollingRef.current = setTimeout(fetchTransactionData, 1000);

        return () => {
            isMounted = false;
            if (pollingRef.current) clearTimeout(pollingRef.current);
        };
    }, [authToken, setSubscription]);

    if (isProcessing) {
        return <LoadingPage message="Verifying your payment..." />;
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#202020] p-4">
                <div className="mx-auto max-w-md pt-20">
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20">
                            <MdCancel className="h-8 w-8 text-red-500" />
                        </div>
                        <h1 className="mb-4 text-2xl font-bold text-white">Verification Error</h1>
                        <p className="mb-8 text-gray-300">{error}</p>
                        <div className="space-y-3">
                            <Button
                                onClick={() => router.push("/dashboard/subscription")}
                                className="w-full bg-orange-600 hover:bg-orange-700"
                            >
                                Check Subscription
                            </Button>
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="w-full bg-gray-600 hover:bg-gray-700"
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#202020] p-4">
            <div className="mx-auto max-w-md pt-20">
                <div className="text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
                        <BiCheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h1 className="mb-4 text-2xl font-bold text-white">Payment Successful!</h1>
                    <p className="mb-6 text-gray-300">
                        Your Bitcoin purchase has been processed successfully.
                    </p>

                    {/* Transaction Details */}
                    {transactionData && (
                        <div className="mb-8 rounded-lg bg-gray-800/50 p-4 text-left">
                            <h3 className="mb-3 font-medium text-orange-400">
                                Transaction Details
                            </h3>
                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className="text-green-400">{transactionData.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Payment ID:</span>
                                    <span className="font-mono text-xs">
                                        {transactionData.payhere_pay_id}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Amount:</span>
                                    <span>
                                        LKR{" "}
                                        {Number(transactionData.package_amount).toLocaleString(
                                            "en-LK",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Satoshis Purchased:</span>
                                    <span>
                                        {Number(
                                            transactionData.satoshis_purchased
                                        ).toLocaleString()}{" "}
                                        sats
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>BTC Price:</span>
                                    <span>
                                        Rs.
                                        {Number(
                                            transactionData.btc_price_at_purchase
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Date:</span>
                                    <span>
                                        {new Date(transactionData.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push("/dashboard")}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            onClick={() => router.push("/dashboard/history")}
                            className="w-full bg-gray-600 hover:bg-gray-700"
                        >
                            View Transaction History
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
