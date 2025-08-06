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
import { LoadingSpinner } from "@/components/LoadingPage";
import ListItemSkeleton from "@/components/skeletons/ListItemSkeleton";
import Image from "next/image";
import { Button, Input } from "@telegram-apps/telegram-ui";
import { usePayHereRedirect } from "@/lib/hooks";
import { createUserSchema, validateField, type CreateUserFormData } from "@/lib/validations";

export default function SubscriptionPage() {
    const router = useRouter();
    const { setIsExistingUser, setUser, setSubscription } = useStore();
    const launchParams = useLaunchParams();
    const backButton = useBackButton();
    const redirectToPayHereViaPage = usePayHereRedirect();

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
    const [registrationData, setRegistrationData] = useState<CreateUserFormData>({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
    });
    const [validationErrors, setValidationErrors] = useState<
        Partial<Record<keyof CreateUserFormData, string>>
    >({});
    const [touchedFields, setTouchedFields] = useState<
        Partial<Record<keyof CreateUserFormData, boolean>>
    >({});

    // Check if form is valid for submission
    const isFormValid = () => {
        // Check if all required fields are filled and valid
        const requiredFields: (keyof CreateUserFormData)[] = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "address",
            "city",
            "country",
        ];

        // Ensure all required fields have values
        const allRequiredFieldsFilled = requiredFields.every(
            (field) => registrationData[field] && registrationData[field].trim() !== ""
        );

        if (!allRequiredFieldsFilled) return false;

        // Check if there are any validation errors
        const hasValidationErrors = Object.keys(validationErrors).some(
            (key) => validationErrors[key as keyof CreateUserFormData]
        );

        if (hasValidationErrors) return false;

        // Validate the entire form data to ensure it passes schema validation
        try {
            createUserSchema.parse(registrationData);
            return true;
        } catch {
            return false;
        }
    };

    // Fetch packages function
    const fetchPackages = async () => {
        try {
            setPackagesLoading(true);
            setPackagesError(null);

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

    const handleRegistrationSubmit = async () => {
        if (!authToken || !telegramUserData) {
            setAuthError("Missing authentication data");
            return;
        }

        // Validate all form data
        const validationResult = createUserSchema.safeParse(registrationData);
        if (!validationResult.success) {
            const fieldErrors: Partial<Record<keyof CreateUserFormData, string>> = {};
            validationResult.error.issues.forEach((issue) => {
                if (issue.path && issue.path[0]) {
                    fieldErrors[issue.path[0] as keyof CreateUserFormData] = issue.message;
                }
            });
            setValidationErrors(fieldErrors);
            // Mark all fields as touched to show errors
            setTouchedFields({
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                country: true,
            });
            setAuthError("Please fix the validation errors before submitting");
            return;
        }

        try {
            setIsRegistering(true);

            const selectedPlanData = packages.find((p) => p.id === selectedPlan);

            // Separate user data from plan data
            const userOnlyData = {
                first_name: registrationData.first_name,
                last_name: registrationData.last_name,
                email: registrationData.email,
                phone: registrationData.phone,
                address: registrationData.address,
                city: registrationData.city,
                country: registrationData.country,
            };

            const planData = {
                selectedPlan: selectedPlan,
                planName: selectedPlanData?.name || "",
            };

            // Register the user first
            await registerUserWithPlan(authToken, userOnlyData, planData);

            // Set user as registered
            setIsExistingUser(true);
            setUser({
                id: telegramUserData.id?.toString() || "",
                username: telegramUserData.username || "",
                isExisting: true,
            });

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
                // Pass the complete URL directly to redirectToPayHereViaPage
                redirectToPayHereViaPage(payhereResult.link);
            } else {
                // Fallback: If PayHere link generation fails, create local subscription and redirect to dashboard
                console.warn("⚠️ No PayHere link received, creating local membership as fallback");

                // Redirect to dashboard
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Registration or PayHere generation failed:", error);
            setAuthError("Registration failed. Please try again.");
        } finally {
            setIsRegistering(false);
        }
    };

    const handleInputChange = (field: keyof CreateUserFormData, value: string) => {
        setRegistrationData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Mark field as touched
        setTouchedFields((prev) => ({ ...prev, [field]: true }));

        // Validate field in real-time
        const validation = validateField(field, value);
        setValidationErrors((prev) => ({
            ...prev,
            [field]: validation.isValid ? undefined : validation.error,
        }));

        // Clear general auth error when user starts fixing validation issues
        if (authError && validation.isValid) {
            setAuthError(null);
        }
    };

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
        <div className="relative min-h-screen bg-[#202020]">
            {isRegistering && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                    <LoadingSpinner />
                </div>
            )}
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
                        <div className="space-y-1">
                            {/* First Name */}
                            <div>
                                <Input
                                    type="text"
                                    status={
                                        touchedFields.first_name && validationErrors.first_name
                                            ? "error"
                                            : undefined
                                    }
                                    header={
                                        <>
                                            First Name <span className="text-red-500">*</span>
                                        </>
                                    }
                                    value={registrationData.first_name}
                                    onChange={(e) =>
                                        handleInputChange("first_name", e.target.value)
                                    }
                                    placeholder="Enter your first name"
                                    required
                                />
                                {touchedFields.first_name && validationErrors.first_name && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {validationErrors.first_name}
                                    </p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <Input
                                    type="text"
                                    status={
                                        touchedFields.last_name && validationErrors.last_name
                                            ? "error"
                                            : undefined
                                    }
                                    header={
                                        <>
                                            Last Name <span className="text-red-500">*</span>
                                        </>
                                    }
                                    value={registrationData.last_name}
                                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                                    placeholder="Enter your last name"
                                    required
                                />
                                {touchedFields.last_name && validationErrors.last_name && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {validationErrors.last_name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <Input
                                    type="email"
                                    status={
                                        touchedFields.email && validationErrors.email
                                            ? "error"
                                            : undefined
                                    }
                                    header={
                                        <>
                                            Email Address <span className="text-red-500">*</span>
                                        </>
                                    }
                                    value={registrationData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="e.g. example@gmail.com"
                                    required
                                />
                                {touchedFields.email && validationErrors.email && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <Input
                                    type="tel"
                                    status={
                                        touchedFields.phone && validationErrors.phone
                                            ? "error"
                                            : undefined
                                    }
                                    header={
                                        <>
                                            Phone Number <span className="text-red-500">*</span>
                                        </>
                                    }
                                    value={registrationData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    placeholder="e.g. +94771234567"
                                    required
                                />
                                {touchedFields.phone && validationErrors.phone && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {validationErrors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <Input
                                    type="text"
                                    status={
                                        touchedFields.address && validationErrors.address
                                            ? "error"
                                            : undefined
                                    }
                                    header={
                                        <>
                                            Address <span className="text-red-500">*</span>
                                        </>
                                    }
                                    value={registrationData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    placeholder="Enter your address"
                                    required
                                />
                                {touchedFields.address && validationErrors.address && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {validationErrors.address}
                                    </p>
                                )}
                            </div>

                            {/* City */}
                            <div>
                                <Input
                                    type="text"
                                    status={
                                        touchedFields.city && validationErrors.city
                                            ? "error"
                                            : undefined
                                    }
                                    header={
                                        <>
                                            City <span className="text-red-500">*</span>
                                        </>
                                    }
                                    value={registrationData.city}
                                    onChange={(e) => handleInputChange("city", e.target.value)}
                                    placeholder="e.g. Colombo"
                                    required
                                />
                                {touchedFields.city && validationErrors.city && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {validationErrors.city}
                                    </p>
                                )}
                            </div>

                            {/* Country */}
                            <div>
                                <Input
                                    type="text"
                                    status={
                                        touchedFields.country && validationErrors.country
                                            ? "error"
                                            : undefined
                                    }
                                    header={
                                        <>
                                            Country <span className="text-red-500">*</span>
                                        </>
                                    }
                                    value={registrationData.country}
                                    onChange={(e) => handleInputChange("country", e.target.value)}
                                    placeholder="Enter your country"
                                    required
                                />
                                {touchedFields.country && validationErrors.country && (
                                    <p className="pl-6 text-sm text-red-500">
                                        {validationErrors.country}
                                    </p>
                                )}
                            </div>
                        </div>

                        <section className="p-4">
                            {/* Submit Button */}
                            <Button
                                onClick={handleRegistrationSubmit}
                                disabled={isRegistering || !isFormValid()}
                                className={cn(
                                    "mt-2 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300",
                                    isRegistering || !isFormValid()
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
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
