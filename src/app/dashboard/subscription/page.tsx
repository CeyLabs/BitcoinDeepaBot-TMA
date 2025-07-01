"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { SubscriptionPlan } from "@/lib/types";
import { cn } from "@/lib/cn";
import LoadingPage from "@/components/LoadingPage";

export default function SubscriptionPage() {
    const [selectedPlan, setSelectedPlan] = useState<string>("stacker-weekly");
    const [activeTab, setActiveTab] = useState<"plans" | "status">("plans");
    const { subscription, setSubscription, addTransaction } = useStore();
    
    // Package state
    const [packages, setPackages] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    errorData.message || `Failed to fetch packages: ${response.status} ${response.statusText}`
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

    const refetch = () => {
        fetchPackages();
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleSubscribe = (plan: SubscriptionPlan) => {
        const newSubscription = {
            id: Date.now().toString(),
            planName: plan.name,
            planType: plan.type,
            price: plan.amount,
            currency: plan.currency,
            startDate: new Date().toISOString(),
            endDate: new Date(
                Date.now() + (plan.type === "weekly" ? 7 : 30) * 24 * 60 * 60 * 1000
            ).toISOString(),
            isActive: true,
        };

        setSubscription(newSubscription);

        // Add transaction
        addTransaction({
            id: Date.now().toString(),
            type: "subscription",
            amount: plan.amount,
            currency: plan.currency,
            date: new Date().toLocaleDateString(),
            description: `${plan.name} Subscription`,
            status: "completed",
        });
    };

    const handleCancelSubscription = () => {
        if (subscription) {
            addTransaction({
                id: Date.now().toString(),
                type: "subscription",
                amount: 0,
                currency: subscription.currency,
                date: new Date().toLocaleDateString(),
                description: `Cancelled ${subscription.planName}`,
                status: "completed",
            });
            setSubscription(null);
        }
    };

    // Show loading state
    if (loading) {
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
                    <h2 className="mb-2 text-xl font-semibold text-gray-400">
                        No Plans Available
                    </h2>
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
                            const plan = packages.find((p: SubscriptionPlan) => p.id === selectedPlan);
                            if (plan) handleSubscribe(plan);
                        }}
                        className="w-full rounded-lg bg-orange-600 py-4 font-medium text-white transition-colors hover:bg-orange-700"
                    >
                        Subscribe →
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {subscription ? (
                        <>
                            <div className="text-center">
                                <h2 className="mb-2 text-lg font-medium">
                                    You are subscribed to the
                                </h2>
                                <h3 className="text-xl font-semibold">
                                    {subscription.planName} plan.
                                </h3>
                            </div>

                            <button
                                onClick={handleCancelSubscription}
                                className="w-full rounded-lg bg-orange-600 py-4 font-medium text-white transition-colors hover:bg-orange-700"
                            >
                                Cancel Subscription
                            </button>
                        </>
                    ) : (
                        <div className="py-8 text-center">
                            <h2 className="mb-4 text-lg font-medium">No Active Subscription</h2>
                            <p className="mb-6 text-gray-400">Choose a plan to get started</p>
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
