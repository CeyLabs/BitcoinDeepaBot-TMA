"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLaunchParams, useBackButton } from "@telegram-apps/sdk-react";
import Image from "next/image";
import { Button } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";
import LoadingPage from "@/components/LoadingPage";
import { getAuthTokenFromStorage } from "@/lib/auth";

export default function VerificationPage() {
    const router = useRouter();
    const launchParams = useLaunchParams();
    const backButton = useBackButton();

    const [isLoading, setIsLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<
        "pending" | "success" | "failed" | null
    >(null);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);

    // Get auth token
    const authToken = getAuthTokenFromStorage();

    useEffect(() => {
        // Show back button
        backButton.show();

        const handleBackClick = () => {
            router.back();
        };

        backButton.on("click", handleBackClick);

        return () => {
            backButton.off("click", handleBackClick);
            backButton.hide();
        };
    }, [backButton, router]);

    useEffect(() => {
        // Get user data from Telegram
        const initData = launchParams.initData;
        if (initData?.user) {
            setUserData(initData.user);
        }
    }, [launchParams]);

    const initiateVerification = async () => {
        if (!authToken) {
            setError("Authentication required");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Call your API to initiate didit.me verification
            const response = await fetch("/api/user/kyc/initiate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    user_id: userData?.id,
                    username: userData?.username,
                    first_name: userData?.firstName,
                    last_name: userData?.lastName,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Verification initiation failed");
            }

            // Redirect to didit.me verification URL
            if (result.verification_url || result.session_id) {
                window.location.href = result.url;
            } else {
                throw new Error("No verification URL received");
            }
        } catch (error) {
            console.error("Verification error:", error);
            setError(error instanceof Error ? error.message : "Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    const checkVerificationStatus = async () => {
        if (!authToken) return;

        try {
            const response = await fetch("/api/user/kyc/status", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            const result = await response.json();

            if (response.ok) {
                setVerificationStatus(result.status);

                if (result.status === "success") {
                    // Redirect to subscription page after successful verification
                    setTimeout(() => {
                        router.push("/subscription");
                    }, 2000);
                }
            }
        } catch (error) {
            console.error("Status check error:", error);
        }
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-md px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mb-6 flex justify-center">
                        {verificationStatus === "success" ? (
                            <Image
                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Check%20Mark%20Button.webp"
                                width={120}
                                height={120}
                                alt="Verification Success"
                            />
                        ) : verificationStatus === "failed" ? (
                            <Image
                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Cross%20Mark.webp"
                                width={120}
                                height={120}
                                alt="Verification Failed"
                            />
                        ) : (
                            <Image
                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Identification%20Card.webp"
                                width={120}
                                height={120}
                                alt="Identity Verification"
                            />
                        )}
                    </div>

                    {verificationStatus === "success" ? (
                        <>
                            <h1 className="mb-4 text-3xl font-bold text-green-400">
                                Verification Complete!
                            </h1>
                            <p className="text-lg text-gray-300">
                                Your identity has been successfully verified. Redirecting to
                                subscription...
                            </p>
                        </>
                    ) : verificationStatus === "failed" ? (
                        <>
                            <h1 className="mb-4 text-3xl font-bold text-red-400">
                                Verification Failed
                            </h1>
                            <p className="text-lg text-gray-300">
                                Identity verification was unsuccessful. Please try again.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="mb-4 text-3xl font-bold text-white">
                                Identity Verification
                            </h1>
                            <p className="text-lg text-gray-300">
                                Complete your identity verification to continue with Bitcoin දීප
                            </p>
                        </>
                    )}
                </div>

                {/* Verification Steps */}
                {verificationStatus !== "success" && verificationStatus !== "failed" && (
                    <div className="mb-6 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-orange-600/10 p-4">
                        <h3 className="mb-3 text-sm font-medium text-orange-400">
                            Verification Process
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 h-2 w-2 rounded-full bg-orange-500"></div>
                                <div>
                                    <p className="text-sm text-white">Document Upload</p>
                                    <p className="text-xs text-gray-400">
                                        Upload your government-issued ID
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 h-2 w-2 rounded-full bg-orange-500"></div>
                                <div>
                                    <p className="text-sm text-white">Selfie Verification</p>
                                    <p className="text-xs text-gray-400">
                                        Take a live selfie for biometric matching
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 h-2 w-2 rounded-full bg-orange-500"></div>
                                <div>
                                    <p className="text-sm text-white">AI Verification</p>
                                    <p className="text-xs text-gray-400">
                                        Automated verification by didit.me
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Message */}
                {verificationStatus === "pending" && (
                    <div className="mb-6 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                            <div>
                                <p className="text-sm font-medium text-blue-400">
                                    Verification in Progress
                                </p>
                                <p className="text-xs text-gray-400">
                                    Please complete the verification process
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-600/10 p-4">
                        <div className="flex items-center gap-3">
                            <svg
                                className="h-5 w-5 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-red-400">
                                    Verification Error
                                </p>
                                <p className="text-xs text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                    {verificationStatus === "success" ? (
                        <Button
                            onClick={() => router.push("/subscription")}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-lg font-semibold text-white"
                        >
                            Continue to Subscription
                        </Button>
                    ) : verificationStatus === "failed" ? (
                        <Button
                            onClick={initiateVerification}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-lg font-semibold text-white"
                        >
                            {isLoading ? "Starting Verification..." : "Try Verification Again"}
                        </Button>
                    ) : verificationStatus === "pending" ? (
                        <div className="space-y-3">
                            <Button
                                onClick={checkVerificationStatus}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-lg font-semibold text-white"
                            >
                                Check Verification Status
                            </Button>
                            <Button
                                onClick={() => setVerificationStatus(null)}
                                className="w-full bg-gray-700 px-6 py-4 text-lg font-semibold text-white hover:bg-gray-600"
                            >
                                Start New Verification
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={initiateVerification}
                            disabled={isLoading || !userData}
                            className={cn(
                                "w-full px-6 py-4 text-lg font-semibold text-white transition-all duration-300",
                                isLoading || !userData
                                    ? "cursor-not-allowed bg-gray-700 opacity-50"
                                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
                            )}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Starting Verification...
                                </div>
                            ) : (
                                "Start Identity Verification"
                            )}
                        </Button>
                    )}
                </div>

                {/* Skip Option (if needed for testing) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => router.push("/subscription")}
                            className="text-sm text-gray-500 underline hover:text-gray-400"
                        >
                            Skip Verification (Development Only)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
