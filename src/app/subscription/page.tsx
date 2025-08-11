"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLaunchParams, useBackButton } from "@telegram-apps/sdk-react";
import {
    authenticateWithTelegram,
    getAuthTokenFromStorage,
    registerUserWithPlan,
    saveAuthToStorage,
} from "@/lib/auth";
import { useStore } from "@/lib/store";
import type { SubscriptionPlan } from "@/lib/types";
import { cn } from "@/lib/cn";
import LoadingPage, { LoadingSpinner } from "@/components/LoadingPage";
import ListItemSkeleton from "@/components/skeletons/ListItemSkeleton";
import Image from "next/image";
import { Button, Input } from "@telegram-apps/telegram-ui";
import { usePayHereRedirect } from "@/lib/hooks";
import { createUserSchema, type CreateUserFormData } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SubscriptionPage() {
    const router = useRouter();
    const { setIsExistingUser, setUser } = useStore();
    const launchParams = useLaunchParams();
    const backButton = useBackButton();
    const redirectToPayHereViaPage = usePayHereRedirect();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
        mode: "onChange",
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            country: "",
        },
    });

    // Get auth token from localStorage
    const authToken = getAuthTokenFromStorage();

    // Package state
    const [packages, setPackages] = useState<SubscriptionPlan[]>([]);
    const [packagesLoading, setPackagesLoading] = useState(true);
    const [packagesError, setPackagesError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [telegramUserData, setTelegramUserData] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

    // Check if form is valid for submission
    const isFormValid = isValid;

    // Fetch packages function
    const fetchPackages = async () => {
        try {
            setPackagesLoading(true);
            setPackagesError(null);

            const response = await fetch("/api/packages", {
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
            setSelectedPlan(packagesArray[0].id);
        } catch (err) {
            console.error("❌ Error fetching packages:", err);
            setPackagesError(err instanceof Error ? err.message : "Failed to fetch packages");
            setPackages([]); // Set empty array on error
        } finally {
            setPackagesLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    // Handle Telegram back button
    useEffect(() => {
        if (showRegistrationForm) {
            backButton.show();

            const handleBackClick = () => {
                setShowRegistrationForm(false);
            };

            backButton.on("click", handleBackClick);

            return () => {
                backButton.off("click", handleBackClick);
                backButton.hide();
            };
        } else {
            backButton.hide();
        }
    }, [showRegistrationForm, backButton]);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true);
                setAuthError(null);

                const initDataRaw = launchParams.initDataRaw;

                if (initDataRaw) {
                    const initData = launchParams.initData;
                    const user = initData?.user;

                    if (user) {
                        setTelegramUserData(user);

                        // Authenticate to get token
                        const authResult = await authenticateWithTelegram(initDataRaw);

                        if (authResult.token) {
                            // Save auth token to localStorage
                            saveAuthToStorage(authResult.token);
                        } else {
                            setAuthError("Failed to authenticate with Telegram");
                        }
                    } else {
                        setAuthError("No user data available from Telegram");
                    }
                } else {
                    setAuthError("No Telegram data available");
                }
            } catch (error) {
                console.error("Error during authentication:", error);
                setAuthError("Authentication failed. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [launchParams]);

    // Cleanup back button on component unmount
    useEffect(() => {
        return () => {
            backButton.hide();
        };
    }, [backButton]);

    const handlePlanSelection = () => {
        if (selectedPlan) {
            setShowRegistrationForm(true);
        }
    };

    // Form submission handler
    const onSubmit = async (formData: CreateUserFormData) => {
        if (!authToken || !telegramUserData) {
            setAuthError("Missing authentication data");
            return;
        }

        try {
            setIsRegistering(true);
            setAuthError(null);

            const selectedPlanData = packages.find((p) => p.id === selectedPlan);

            const planData = {
                selectedPlan: selectedPlan,
                planName: selectedPlanData?.name || "",
            };

            // Register the user
            await registerUserWithPlan(authToken, formData, planData);

            // Set user as registered
            setIsExistingUser(true);
            setUser({
                id: telegramUserData.id?.toString() || "",
                username: telegramUserData.username || "",
                isExisting: true,
            });

            // Generate PayHere link
            const payhereResponse = await fetch("/api/subscription/payhere-link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    package_id: selectedPlan,
                }),
            });

            const payhereResult = await payhereResponse.json();

            if (!payhereResponse.ok) {
                throw new Error(
                    payhereResult.message ||
                        `Failed to generate PayHere link: ${payhereResponse.statusText}`
                );
            }

            if (payhereResult && payhereResult.link) {
                redirectToPayHereViaPage(payhereResult.link);
            } else {
                console.warn("⚠️ No PayHere link received, redirecting to dashboard");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Registration or PayHere generation failed:", error);
            setAuthError("Registration failed. Please try again.");
        } finally {
            setIsRegistering(false);
        }
    };

    if (isLoading || isRegistering || packagesLoading) {
        return <LoadingPage />;
    }

    if (authError || packagesError) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-red-500">
                        Authentication Error
                    </h2>
                    <p className="mb-4 text-gray-400">{authError || packagesError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-md">
                {!showRegistrationForm ? (
                    // Plan Selection Screen
                    <>
                        {/* Header */}
                        <div className="p-4 text-center">
                            <div className="mb-4 flex justify-center">
                                <Image
                                    src="/btc-animated.webp"
                                    width={100}
                                    height={100}
                                    alt="Ballot Box With Ballot"
                                />
                            </div>
                            <h1 className="mb-2 text-3xl font-bold text-white">Choose Your Plan</h1>
                            <p className="text-lg text-gray-300">Get your Bitcoin දීප Membership</p>
                        </div>

                        {/* Plans */}
                        <div className="mb-2 space-y-3 p-4">
                            {isLoading || packagesLoading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                      <ListItemSkeleton key={i} />
                                  ))
                                : packages.map((plan) => (
                                      <div
                                          key={plan.id}
                                          className={cn(
                                              "flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition-all duration-300",
                                              selectedPlan === plan.id
                                                  ? "border-orange-500 bg-gradient-to-r from-orange-500/10 to-orange-600/10 shadow-lg shadow-orange-500/20"
                                                  : "border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-gray-600"
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
                                            <h3 className="font-medium text-white">{plan.name}</h3>
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

                        <section className="p-4">
                            {/* Subscribe Button */}
                            <Button
                                Component="a"
                                stretched
                                onClick={handlePlanSelection}
                                disabled={!selectedPlan}
                                className={cn(
                                    "p-4",
                                    selectedPlan
                                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                                        : "cursor-not-allowed bg-gray-700 opacity-50"
                                )}
                            >
                                <span className="flex gap-2"> Continue with Selected Plan </span>
                            </Button>

                            {/* Footer */}
                            <div className="p-4 text-center">
                                <p className="text-xs text-gray-500">
                                    Activate your Bitcoin දීප Membership today, grow with the
                                    community, cancel anytime.
                                </p>
                            </div>
                        </section>
                    </>
                ) : (
                    // Registration Form Screen
                    <>
                        <section className="p-4">
                            {/* Header */}
                            <div className="mb-8 text-center">
                                <div className="mb-4 flex justify-center">
                                    <Image
                                        src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Hourglass%20Done.webp"
                                        width={100}
                                        height={100}
                                        alt="Registration Form"
                                    />
                                </div>
                                <h1 className="mb-2 text-3xl font-bold text-white">
                                    Complete Registration
                                </h1>
                                <p className="text-lg text-gray-300">
                                    Just a few details to get started
                                </p>
                            </div>

                            {/* Selected Plan Info */}
                            {(() => {
                                const selectedPlanData = packages.find(
                                    (p) => p.id === selectedPlan
                                );
                                return selectedPlanData ? (
                                    <div className="mb-6 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-orange-600/10 p-4">
                                        <div className="text-center">
                                            <p className="text-md text-white">Selected Plan</p>
                                            <p className="text-lg font-semibold text-orange-500">
                                                {selectedPlanData.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                රු. {selectedPlanData.amount.toLocaleString()}{" "}
                                                {selectedPlanData.type}
                                            </p>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </section>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
                            {/* First Name */}
                            <div>
                                <Input
                                    type="text"
                                    status={errors.first_name ? "error" : undefined}
                                    header={
                                        <>
                                            First Name <span className="text-red-500">*</span>
                                        </>
                                    }
                                    {...register("first_name")}
                                    placeholder="Enter your first name"
                                />
                                {errors.first_name && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {errors.first_name.message}
                                    </p>
                                )}
                            </div>
                            {/* Last Name */}
                            <div>
                                <Input
                                    type="text"
                                    status={errors.last_name ? "error" : undefined}
                                    header={
                                        <>
                                            Last Name <span className="text-red-500">*</span>
                                        </>
                                    }
                                    {...register("last_name")}
                                    placeholder="Enter your last name"
                                />
                                {errors.last_name && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {errors.last_name.message}
                                    </p>
                                )}
                            </div>
                            {/* Email */}
                            <div>
                                <Input
                                    type="email"
                                    status={errors.email ? "error" : undefined}
                                    header={
                                        <>
                                            Email <span className="text-red-500">*</span>
                                        </>
                                    }
                                    {...register("email")}
                                    placeholder="e.g. example@gmail.com"
                                />
                                {errors.email && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                            {/* Phone */}
                            <div>
                                <Input
                                    type="tel"
                                    status={errors.phone ? "error" : undefined}
                                    header={
                                        <>
                                            Phone <span className="text-red-500">*</span>
                                        </>
                                    }
                                    {...register("phone")}
                                    placeholder="e.g. +94771234567"
                                />
                                {errors.phone && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                            {/* Address */}
                            <div>
                                <Input
                                    type="text"
                                    status={errors.address ? "error" : undefined}
                                    header={
                                        <>
                                            Address <span className="text-red-500">*</span>
                                        </>
                                    }
                                    {...register("address")}
                                    placeholder="Enter your address"
                                />
                                {errors.address && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {errors.address.message}
                                    </p>
                                )}
                            </div>
                            {/* City */}
                            <div>
                                <Input
                                    type="text"
                                    status={errors.city ? "error" : undefined}
                                    header={
                                        <>
                                            City <span className="text-red-500">*</span>
                                        </>
                                    }
                                    {...register("city")}
                                    placeholder="e.g. Colombo"
                                />
                                {errors.city && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {errors.city.message}
                                    </p>
                                )}
                            </div>
                            {/* Country */}
                            <div>
                                <Input
                                    type="text"
                                    status={errors.country ? "error" : undefined}
                                    header={
                                        <>
                                            Country <span className="text-red-500">*</span>
                                        </>
                                    }
                                    {...register("country")}
                                    placeholder="Enter your country"
                                />
                                {errors.country && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {errors.country.message}
                                    </p>
                                )}
                            </div>{" "}
                            {/* Submit Button */}
                            <div className="p-4">
                                <Button
                                    type="submit"
                                    disabled={isRegistering || !isFormValid}
                                    className={cn(
                                        "mt-2 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300",
                                        isRegistering || !isFormValid
                                            ? "cursor-not-allowed opacity-50"
                                            : "hover:scale-105 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
                                    )}
                                >
                                    {isRegistering ? (
                                        <div className="flex items-center justify-center">
                                            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Creating account and payment link...
                                        </div>
                                    ) : (
                                        "Complete Registration & Pay →"
                                    )}
                                </Button>

                                {/* Required Fields Note */}
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-500">
                                        <span className="text-red-500">*</span> Required fields
                                    </p>
                                </div>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
