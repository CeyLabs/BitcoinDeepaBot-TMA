"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { getAuthTokenFromStorage } from "@/lib/auth";
import type { SubscriptionPlan } from "@/lib/types";
import { cn } from "@/lib/cn";
import LoadingPage from "@/components/LoadingPage";
import Image from "next/image";
import { initPopup, initHapticFeedback } from "@telegram-apps/sdk-react";
import { usePayHereRedirect } from "@/lib/hooks";
import { Button } from "@telegram-apps/telegram-ui";
import { formatDate } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export default function SubscriptionPage() {
    const [selectedPlan, setSelectedPlan] = useState<string>();
    const [activeTab, setActiveTab] = useState<"plans" | "status">("plans");
    const { subscription, setSubscription } = useStore();

    const redirectToPayHereViaPage = usePayHereRedirect();

    // Initialize Telegram Mini App SDK popup
    const popup = initPopup();
    // Initialize haptic feedback (Telegram Mini App). Safe no-op outside Telegram.
    const haptic = initHapticFeedback();

    // Light haptic helper for toggle changes
    const vibrateLight = () => {
        try {
            // Prefer Telegram selection change haptic
            // @ts-ignore - SDK provides this at runtime
            haptic?.selectionChanged?.();
        } catch {}
        // Fallback for non-Telegram environments (Android Chrome, etc.)
        try {
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                // @ts-ignore - vibrate may exist at runtime
                navigator?.vibrate?.(10);
            }
        } catch {}
    };

    const onTabChange = (tab: "plans" | "status") => {
        vibrateLight();
        setActiveTab(tab);
    };

    // Get auth token from localStorage
    const authToken = getAuthTokenFromStorage();

    // Package state
    const {
        data: packages = [],
        isLoading: loading,
        error,
        refetch: refetchPackages,
    } = useQuery<SubscriptionPlan[]>({
        queryKey: queryKeys.packages,
        queryFn: async () => {
            const response = await fetch("/api/packages", {
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message ||
                        `Failed to fetch packages: ${response.status} ${response.statusText}`
                );
            }
            return Array.isArray(data) ? data : data.packages || [];
        },
        staleTime: 1000 * 60 * 5,
    });

    const errorMessage = error instanceof Error ? error.message : null;

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
                    result.message || `Failed to fetch membership: ${response.statusText}`
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
                    currency: "රු.",
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
                setSelectedPlan(subscriptionData.package_id);

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
            console.error("❌ Error fetching current membership:", err);
            setSubscriptionError(err instanceof Error ? err.message : "Failed to fetch membership");
        } finally {
            setSubscriptionLoading(false);
        }
    }, [authToken, setSubscription, setSelectedPlan, packages, calculateEndDate]);

    const refetch = async () => {
        await refetchPackages();
    };

    useEffect(() => {
        if (packages.length > 0 && !selectedPlan && !subscription?.isActive) {
            setSelectedPlan(packages[0].id);
        }
    }, [packages, selectedPlan, subscription?.isActive]);

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
            console.error("No auth token available for membership");
            return;
        }
        // Show Telegram popup if user has active subscription
        if (subscription && subscription.isActive) {
            popup.open({
                title: "Active Membership",
                message: "First cancel your existing membership to subscribe to another package.",
                buttons: [{ id: "ok", type: "ok" }],
            });

            if (!popup.isOpened) {
                alert("First cancel your existing membership to subscribe to another package.");
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
                    errorData.message || `Failed to cancel membership: ${response.statusText}`
                );
            }

            // Update subscription state
            setSubscription(null);

            if (packages.length > 0) {
                setSelectedPlan(packages[0].id);
            }

            setActiveTab("plans");
        } catch (err) {
            console.error("❌ Error cancelling membership:", err);
            setCancelError(err instanceof Error ? err.message : "Failed to cancel membership");
        } finally {
            setIsCancelling(false);
        }
    };

    // Show loading state
    if (loading && !packages.length) {
        return <LoadingPage />;
    }

    // Show error state with retry option
    if (errorMessage) {
        return (
            <main className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-red-500">
                        Failed to Load Plans
                    </h2>
                    <p className="mb-4 text-gray-400">{errorMessage}</p>
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
            <div className="mb-7 flex items-center justify-center">
                <Image
                    src="/DeepaLogo_WnO.svg"
                    alt="Bitcoin Deepa"
                    width={100}
                    height={50}
                    priority
                />
            </div>

            {/* Tabs - segmented control */}
            <div className="mb-6">
                <div className="relative grid grid-cols-2 items-center rounded-2xl border border-zinc-800 bg-zinc-950/80 p-1">
                    {/* Sliding background */}
                    <div
                        className={cn(
                            "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] transform-gpu rounded-xl bg-zinc-800 transition-transform duration-200 ease-out",
                            activeTab === "status" && "translate-x-full"
                        )}
                    />
                    <button
                        onClick={() => onTabChange("plans")}
                        className={cn(
                            "relative z-10 inline-flex items-center justify-center rounded-xl py-2.5 font-medium transition-colors",
                            activeTab === "plans" ? "text-orange-500" : "text-gray-400"
                        )}
                    >
                        Plans
                    </button>
                    <button
                        onClick={() => onTabChange("status")}
                        className={cn(
                            "relative z-10 inline-flex items-center justify-center rounded-xl py-2.5 font-medium transition-colors",
                            activeTab === "status" ? "text-orange-500" : "text-gray-400"
                        )}
                    >
                        My Membership
                    </button>
                </div>
            </div>

            {/* Smooth content switcher */}
            <div className="relative">
                {/* Plans section */}
                <div
                    className={cn(
                        "w-full transition-opacity duration-200",
                        activeTab === "plans"
                            ? "relative opacity-100"
                            : "pointer-events-none absolute inset-0 opacity-0"
                    )}
                >
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 text-xl font-semibold">
                                Pick your membership plan
                            </h2>

                            <div className="space-y-3">
                                {packages.map((plan: SubscriptionPlan) => (
                                    <div
                                        key={plan.id}
                                        className={cn(
                                            "flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition-all duration-300",
                                            selectedPlan === plan.id
                                                ? "border-orange-500 bg-gradient-to-r from-orange-500/10 to-orange-600/10 shadow-lg shadow-orange-500/20"
                                                : "border-gray-700 bg-zinc-900/50 hover:border-gray-600"
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
                                                <h3 className="font-medium text-white">
                                                    {plan.name}
                                                </h3>
                                                {plan.popular && (
                                                    <span className="text-xs text-orange-500">
                                                        Most Popular
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-orange-500">
                                                රු. {plan.amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-400">{plan.type}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            Component="a"
                            className={cn(
                                "w-full font-medium text-white transition-all duration-300",
                                payhereLinkLoading
                                    ? "cursor-not-allowed bg-gray-600"
                                    : selectedPlan
                                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                      : "cursor-not-allowed bg-gray-700 opacity-50"
                            )}
                            onClick={() => {
                                if (selectedPlan && selectedPlan !== subscription?.packageId) {
                                    const plan = packages.find(
                                        (p: SubscriptionPlan) => p.id === selectedPlan
                                    );
                                    if (plan) handleSubscribe(plan);
                                }
                            }}
                            disabled={
                                payhereLinkLoading || selectedPlan === subscription?.packageId
                            }
                        >
                            {payhereLinkLoading ? (
                                <>
                                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white align-text-bottom"></span>
                                    Connecting to PayHere...
                                </>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Subscribe
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Status section */}
                <div
                    className={cn(
                        "w-full transition-opacity duration-300",
                        activeTab === "status"
                            ? "relative opacity-100"
                            : "pointer-events-none absolute inset-0 opacity-0"
                    )}
                >
                    <div className="space-y-6">
                        {/* Show subscription loading state */}
                        {subscriptionLoading && !subscription ? (
                            <div className="py-8 text-center">
                                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-orange-500"></div>
                                <p className="text-gray-400">Loading membership...</p>
                            </div>
                        ) : subscriptionError ? (
                            <div className="rounded-xl border border-red-500/30 bg-zinc-900/50 p-4 text-center backdrop-blur-sm">
                                <h3 className="mb-2 font-medium text-red-400">
                                    Failed to Load Membership
                                </h3>
                                <p className="mb-4 text-sm text-gray-400">{subscriptionError}</p>
                                <button
                                    onClick={fetchCurrentSubscription}
                                    className="rounded bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-red-800"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : subscription ? (
                            <>
                                <div className="rounded-xl border border-green-500/30 bg-zinc-900/50 p-6 backdrop-blur-sm">
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
                                            Active Membership
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
                                        {subscription.price && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Price:</span>
                                                <span>
                                                    රු. {subscription.price.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {subscription.startDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Started:</span>
                                                <span>{formatDate(subscription.startDate)}</span>
                                            </div>
                                        )}
                                        {subscription.endDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Next billing:</span>
                                                <span>{formatDate(subscription.endDate)}</span>
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
                                    <div className="mb-4 rounded-xl border border-red-500/30 bg-zinc-900/50 p-3 text-center backdrop-blur-sm">
                                        <p className="text-sm text-red-400">{cancelError}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={isCancelling}
                                    className={cn(
                                        "w-full rounded-xl py-4 font-medium text-white transition-all duration-300",
                                        isCancelling
                                            ? "cursor-not-allowed bg-gray-600"
                                            : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                                    )}
                                >
                                    {isCancelling ? (
                                        <>
                                            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white align-text-bottom"></span>
                                            Cancelling...
                                        </>
                                    ) : (
                                        "Cancel Membership"
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
                                <h2 className="mb-4 text-lg font-medium">No Active Membership</h2>
                                <p className="mb-6 text-gray-400">
                                    Choose a plan to get started with your bitcoin දීප membership
                                </p>
                                <Button
                                    Component="a"
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3"
                                    onClick={() => setActiveTab("plans")}
                                >
                                    View Plans
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
