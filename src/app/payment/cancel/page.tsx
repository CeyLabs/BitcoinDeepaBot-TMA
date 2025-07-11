"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@telegram-apps/telegram-ui";
import { MdCancel } from "react-icons/md";
import { getAuthTokenFromStorage } from "@/lib/auth";
import LoadingPage from "@/components/LoadingPage";

interface SubscriptionData {
    id: string;
    is_active: boolean;
    payhere_sub_id?: string;
    plan_name?: string;
    status?: string;
}

export default function PaymentCancelPage() {
    const router = useRouter();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const authToken = getAuthTokenFromStorage();

    useEffect(() => {
        const fetchCurrentSubscription = async () => {
            if (!authToken) {
                setError("No authentication token found");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch("/api/subscription/current", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSubscription(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || "Failed to fetch subscription");
                }
            } catch (err) {
                console.error("Error fetching subscription:", err);
                setError("Error fetching subscription data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrentSubscription();
    }, [authToken]);

    const handleTryAgain = () => {
        router.push("/subscription");
    };

    if (isLoading) {
        return <LoadingPage message="Loading subscription details..." />;
    }

    return (
        <main className="min-h-screen bg-[#202020] p-4">
            <div className="mx-auto max-w-md pt-20">
                <div className="text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20">
                        <MdCancel className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="mb-4 text-2xl font-bold text-white">Payment Cancelled</h1>
                    <p className="mb-6 text-gray-300">
                        Your payment was cancelled. No charges have been made to your account.
                    </p>

                    {/* Show subscription details if available */}
                    {subscription && (
                        <div className="mb-8 rounded-lg bg-gray-800/50 p-4 text-left">
                            <h3 className="mb-3 font-medium text-orange-400">
                                Subscription Details
                            </h3>
                            <div className="space-y-2 text-sm text-gray-300">
                                {subscription.payhere_sub_id && (
                                    <div className="flex justify-between">
                                        <span>PayHere Sub ID:</span>
                                        <span className="font-mono text-xs">
                                            {subscription.payhere_sub_id}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span
                                        className={`${subscription.is_active ? "text-green-400" : "text-red-400"}`}
                                    >
                                        {subscription.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                {subscription.plan_name && (
                                    <div className="flex justify-between">
                                        <span>Plan:</span>
                                        <span>{subscription.plan_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Show error message if subscription fetch failed */}
                    {error && (
                        <div className="mb-8 rounded-lg border border-yellow-500/30 bg-yellow-600/20 p-4 text-left">
                            <h3 className="mb-2 font-medium text-yellow-400">Notice</h3>
                            <p className="text-sm text-gray-300">{error}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={handleTryAgain}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                            Try Again
                        </Button>
                        <Button
                            onClick={() => router.push("/dashboard")}
                            className="w-full bg-gray-600 hover:bg-gray-700"
                        >
                            Go to Dashboard
                        </Button>
                    </div>

                    <div className="mt-4 text-sm text-gray-400">
                        <p>Need help? Contact our support team.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
