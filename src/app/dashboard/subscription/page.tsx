"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { getAuthTokenFromStorage } from "@/lib/auth";
import type { SubscriptionPlan } from "@/lib/types";
import { cn } from "@/lib/cn";
import LoadingPage from "@/components/LoadingPage";
import { initPopup } from "@telegram-apps/sdk-react";
import { usePayHereRedirect } from "@/lib/hooks";

export default function SubscriptionPage() {
    const [selectedPlan, setSelectedPlan] = useState<string>("stacker-weekly");
    const [activeTab, setActiveTab] = useState<"plans" | "status">("plans");
    const { subscription, setSubscription } = useStore();

    const redirectToPayHereViaPage = usePayHereRedirect();

    // Initialize Telegram Mini App SDK popup
    const popup = initPopup();

    // Get auth token from localStorage
    const authToken = getAuthTokenFromStorage();

    // Package state
    const [packages, setPackages] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Subscription fetching state
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

    // Helper function to calculate subscription end date
    const calculateEndDate = useCallback((startDate: string, planType: string) => {
        const start = new Date(startDate);
        const daysToAdd = planType === "weekly" ? 7 : 30; // Assume monthly = 30 days
        const endDate = new Date(start.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        return endDate.toISOString();
    }, []);

    // Fetch packages function
    const fetchPackages = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/packages", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `Failed to fetch packages: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();

            const packagesArray = Array.isArray(data) ? data : data.packages || [];
            setPackages(packagesArray);
        } catch (err) {
            console.error("❌ Error fetching packages:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch packages");
            setPackages([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch current subscription function
    const fetchCurrentSubscription = useCallback(async () => {
        if (!authToken) {
            return;
        }

        if (packages.length === 0) {
            return;
        }

        try {
            setSubscriptionLoading(true);
            setSubscriptionError(null);

            const response = await fetch("/api/subscription/current", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || `Failed to fetch subscription: ${response.statusText}`
                );
            }

            if (result.subscription) {
                // Map subscription with package details
                // The API returns subscription with package_id, but we need to map it to package details
                const subscriptionData = result.subscription;

                // Find the matching package by package_id to get plan name, price, etc.
                const matchingPackage = packages.find(
                    (pkg) => pkg.id === subscriptionData.package_id
                );

                // Create enhanced subscription object with package details
                const enhancedSubscription = {
                    id: subscriptionData.payhere_sub_id,
                    planName: matchingPackage?.name || "Unknown Plan",
                    planType: subscriptionData.frequency || "monthly",
                    price: matchingPackage?.amount || 0,
                    currency: matchingPackage?.currency || "LKR",
                    startDate: subscriptionData.created_at,
                    endDate:
                        subscriptionData.next_billing_date ||
                        (matchingPackage
                            ? calculateEndDate(subscriptionData.created_at, matchingPackage.type)
                            : subscriptionData.updated_at),
                    isActive: subscriptionData.is_active,
                    // Keep original data for reference
                    packageId: subscriptionData.package_id,
                    userId: subscriptionData.user_id,
                    payhereSubId: subscriptionData.payhere_sub_id,
                };

                setSubscription(enhancedSubscription);

                if (!matchingPackage) {
                    console.warn(
                        "⚠️ Package not found for package_id:",
                        subscriptionData.package_id
                    );
                }
            } else {
                setSubscription(null);
            }
        } catch (err) {
            console.error("❌ Error fetching current subscription:", err);
            setSubscriptionError(
                err instanceof Error ? err.message : "Failed to fetch subscription"
            );
        } finally {
            setSubscriptionLoading(false);
        }
    }, [authToken, setSubscription, packages, calculateEndDate]);

    const refetch = async () => {
        await fetchPackages();
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    // Fetch current subscription when auth token is available
    useEffect(() => {
        if (authToken && packages.length > 0) {
            fetchCurrentSubscription();
        }
    }, [authToken, packages.length, fetchCurrentSubscription]);

    // State for PayHere link
    const [payhereLink, setPayhereLink] = useState<string | null>(null);
    const [payhereLinkLoading, setPayhereLinkLoading] = useState(false);
    const [payhereLinkError, setPayhereLinkError] = useState<string | null>(null);

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        if (!authToken) {
            console.error("No auth token available for subscription");
            return;
        }
        // Show Telegram popup if user has active subscription
        if (subscription && subscription.isActive) {
            popup.open({
                title: "Active Subscription",
                message: "First cancel your existing subscription to subscribe to another package.",
                buttons: [{ id: "ok", type: "ok" }],
            });

            if (!popup.isOpened) {
                alert("First cancel your existing subscription to subscribe to another package.");
            }
            return;
        }

        try {
            setPayhereLinkLoading(true);
            setPayhereLinkError(null);

            // Generate PayHere link
            const response = await fetch("/api/subscription/payhere-link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    package_id: plan.id,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || `Failed to generate PayHere link: ${response.statusText}`
                );
            }

            if (result.link) {
                // Pass the complete URL directly to redirectToPayHereViaPage
                redirectToPayHereViaPage(result.link);
            } else {
                throw new Error("No PayHere link received");
            }
        } catch (err) {
            console.error("❌ Error generating PayHere link:", err);
            setPayhereLinkError(
                err instanceof Error ? err.message : "Failed to generate PayHere link"
            );
        }
    };

    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);

    const handleCancelSubscription = async () => {
        if (!authToken) return;

        try {
            setIsCancelling(true);
            setCancelError(null);

            // Call the API to cancel subscription
            const response = await fetch("/api/subscription/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || `Failed to cancel subscription: ${response.statusText}`
                );
            }

            // Update subscription state
            setSubscription(null);
        } catch (err) {
            console.error("❌ Error cancelling subscription:", err);
            setCancelError(err instanceof Error ? err.message : "Failed to cancel subscription");
        } finally {
            setIsCancelling(false);
        }
    };

    // Show loading state
    if (loading && !packages.length) {
        return <LoadingPage />;
    }

    // Show error state with retry option
    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-red-500">
                        Failed to Load Plans
                    </h2>
                    <p className="mb-4 text-gray-400">{error}</p>
                    <button
                        onClick={refetch}
                        className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-700"
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    // Show empty state if no packages
    if (packages.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-gray-400">No Plans Available</h2>
                    <p className="mb-4 text-gray-500">Please check back later</p>
                    <button
                        onClick={refetch}
                        className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-700"
                    >
                        Refresh
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="pb-20">
            {/* Header */}
            <div className="mb-6 flex items-center justify-center">
                <h1 className="text-xl font-bold">Bitcoin Deepa</h1>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex">
                <button
                    onClick={() => setActiveTab("plans")}
                    className={cn(
                        "flex-1 border-b-2 py-3 text-center font-medium transition-colors",
                        activeTab === "plans"
                            ? "border-orange-500 text-orange-500"
                            : "border-transparent text-gray-400"
                    )}
                >
                    Plans
                </button>
                <button
                    onClick={() => setActiveTab("status")}
                    className={cn(
                        "flex-1 border-b-2 py-3 text-center font-medium transition-colors",
                        activeTab === "status"
                            ? "border-orange-500 text-orange-500"
                            : "border-transparent text-gray-400"
                    )}
                >
                    My Subscription
                </button>
            </div>

            {activeTab === "plans" ? (
                <div className="space-y-6">
                    <div>
                        <h2 className="mb-4 text-xl font-semibold">Pick your auto-stack plan</h2>

                        <div className="space-y-3">
                            {packages.map((plan: SubscriptionPlan) => (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        "flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-colors",
                                        selectedPlan === plan.id
                                            ? "border-orange-500 bg-orange-500/10"
                                            : "border-gray-700 bg-gray-800/50"
                                    )}
                                    onClick={() => setSelectedPlan(plan.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "flex h-5 w-5 items-center justify-center rounded-full border-2",
                                                selectedPlan === plan.id
                                                    ? "border-orange-500"
                                                    : "border-gray-500"
                                            )}
                                        >
                                            {selectedPlan === plan.id && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{plan.name}</h3>
                                            {plan.popular && (
                                                <span className="text-xs text-orange-500">
                                                    Most Popular
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="font-semibold text-orange-500">
                                        {plan.currency} {plan.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            const plan = packages.find(
                                (p: SubscriptionPlan) => p.id === selectedPlan
                            );
                            if (plan) handleSubscribe(plan);
                        }}
                        disabled={payhereLinkLoading}
                        className={`w-full rounded-lg py-4 font-medium text-white transition-colors ${
                            payhereLinkLoading
                                ? "cursor-not-allowed bg-gray-600"
                                : "bg-orange-600 hover:bg-orange-700"
                        }`}
                    >
                        {payhereLinkLoading ? (
                            <>
                                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white align-text-bottom"></span>
                                Connecting to PayHere...
                            </>
                        ) : (
                            "Subscribe →"
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Show subscription loading state */}
                    {subscriptionLoading && !subscription ? (
                        <div className="py-8 text-center">
                            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-orange-500"></div>
                            <p className="text-gray-400">Loading subscription...</p>
                        </div>
                    ) : subscriptionError ? (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
                            <h3 className="mb-2 font-medium text-red-400">
                                Failed to Load Subscription
                            </h3>
                            <p className="mb-4 text-sm text-gray-400">{subscriptionError}</p>
                            <button
                                onClick={fetchCurrentSubscription}
                                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : subscription ? (
                        <>
                            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6">
                                <div className="text-center">
                                    <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                                        <svg
                                            className="h-6 w-6 text-green-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="mb-2 text-lg font-medium text-green-400">
                                        Active Subscription
                                    </h2>
                                    <h3 className="text-xl font-semibold">
                                        {subscription.planName || "Premium Plan"}
                                    </h3>
                                    {subscription.planType && (
                                        <p className="mt-1 text-sm capitalize text-gray-400">
                                            {subscription.planType} billing
                                        </p>
                                    )}
                                </div>

                                {/* Subscription Details */}
                                <div className="mt-4 space-y-2 text-sm">
                                    {subscription.price && subscription.currency && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Price:</span>
                                            <span>
                                                {subscription.currency}{" "}
                                                {subscription.price.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {subscription.startDate && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Started:</span>
                                            <span>
                                                {new Date(
                                                    subscription.startDate
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {subscription.endDate && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Next billing:</span>
                                            <span>
                                                {new Date(
                                                    subscription.endDate
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Status:</span>
                                        <span
                                            className={cn(
                                                "font-medium",
                                                subscription.isActive
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                            )}
                                        >
                                            {subscription.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {cancelError && (
                                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
                                    <p className="text-sm text-red-400">{cancelError}</p>
                                </div>
                            )}

                            <button
                                onClick={handleCancelSubscription}
                                disabled={isCancelling}
                                className={`w-full rounded-lg py-4 font-medium text-white transition-colors ${
                                    isCancelling
                                        ? "cursor-not-allowed bg-gray-600"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {isCancelling ? (
                                    <>
                                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white align-text-bottom"></span>
                                        Cancelling...
                                    </>
                                ) : (
                                    "Cancel Subscription"
                                )}
                            </button>
                        </>
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
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                            </div>
                            <h2 className="mb-4 text-lg font-medium">No Active Subscription</h2>
                            <p className="mb-6 text-gray-400">
                                Choose a plan to get started with automated Bitcoin stacking
                            </p>
                            <button
                                onClick={() => setActiveTab("plans")}
                                className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700"
                            >
                                View Plans
                            </button>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
