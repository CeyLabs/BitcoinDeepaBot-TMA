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
                    setError(errorData.message || "Failed to fetch membership");
                }
            } catch (err) {
                console.error("Error fetching membership:", err);
                setError("Error fetching membership data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrentSubscription();
    }, [authToken]);

    if (isLoading) {
        return <LoadingPage message="Loading membership details..." />;
    }

    return (
        <main className="min-h-screen p-4">
            <div className="mx-auto max-w-md pt-20">
                <div className="text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20">
                        <MdCancel className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="mb-4 text-2xl font-bold text-tma-text-primary">Payment Cancelled</h1>
                    <p className="mb-6 text-tma-text-secondary">
                        Your payment was cancelled. No charges have been made to your account.
                    </p>

                    {/* Show error message if subscription fetch failed */}
                    {error && (
                        <div className="mb-8 rounded-lg border border-yellow-500/30 bg-yellow-600/20 p-4 text-left">
                            <h3 className="mb-2 font-medium text-yellow-400">Notice</h3>
                            <p className="text-sm text-tma-text-secondary">{error}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push("/dashboard")}
                            className="w-full bg-gray-600 hover:bg-gray-700"
                        >
                            Go to Dashboard
                        </Button>
                    </div>

                    <div className="mt-4 text-sm text-tma-text-secondary">
                        <p>Need help? Contact our support team.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
