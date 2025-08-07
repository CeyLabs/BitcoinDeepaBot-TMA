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
        | "NOT_STARTED"
        | "IN_PROGRESS"
        | "APPROVED"
        | "DECLINED"
        | "KYC_EXPIRED"
        | "IN_REVIEW"
        | "EXPIRED"
        | "ABANDONED"
        | null
    >(null);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(true);
    const [showMobileWarning, setShowMobileWarning] = useState(false);
    const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

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

        // Detect if user is on mobile device
        const checkMobile = () => {
            const isTelegramMobile =
                (window as any).Telegram?.WebApp?.platform === "ios" ||
                (window as any).Telegram?.WebApp?.platform === "android";

            return isTelegramMobile;
        };

        setIsMobile(checkMobile());
    }, [launchParams]);

    // Check verification status on page load
    useEffect(() => {
        const checkStatusOnLoad = async () => {
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

                    // Store verification URL if available (for IN_PROGRESS status)
                    if (result.url) {
                        setVerificationUrl(result.url);
                    }

                    if (result.status === "APPROVED") {
                        // Redirect to subscription page after successful verification
                        setTimeout(() => {
                            router.push("/dashboard/subscription");
                        }, 2000);
                    }
                }
            } catch (error) {
                console.error("Status check error:", error);
            }
        };

        if (authToken) {
            checkStatusOnLoad();
        }
    }, [authToken, router]);

    const initiateVerification = async () => {
        if (!authToken) {
            setError("Authentication required");
            return;
        }

        // Check if mobile device before starting verification
        if (!isMobile) {
            setShowMobileWarning(true);
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

            if (result.url) {
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

                // Store verification URL if available (for IN_PROGRESS status)
                if (result.url) {
                    setVerificationUrl(result.url);
                }

                if (result.status === "APPROVED") {
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

    const continueVerification = () => {
        // Check if mobile device before starting verification
        if (!isMobile) {
            setShowMobileWarning(true);
            return;
        }

        if (verificationUrl) {
            if ((window as any).Telegram?.WebApp) {
                (window as any).Telegram.WebApp.openLink(verificationUrl);
            } else {
                window.open(verificationUrl, "_blank");
            }
        }
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    // Show mobile warning if user is on desktop
    if (showMobileWarning) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#202020] p-6">
                <div className="max-w-md space-y-6 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-500/20">
                        <svg
                            className="h-12 w-12 text-yellow-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">Use Mobile Device</h1>
                        <p className="text-gray-400">
                            Identity verification works best on mobile devices for security and
                            camera access.
                        </p>
                    </div>

                    <div className="space-y-3 rounded-xl bg-gray-800/50 p-4 text-left">
                        <h3 className="mb-3 text-lg font-semibold text-white">
                            How to verify on mobile:
                        </h3>
                        <div className="flex items-start space-x-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                                1
                            </div>
                            <p className="text-sm text-gray-300">
                                Open Telegram on your mobile phone
                            </p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                                2
                            </div>
                            <p className="text-sm text-gray-300">
                                Navigate to our bot and access the mini app
                            </p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                                3
                            </div>
                            <p className="text-sm text-gray-300">
                                Start the verification process from there
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => setShowMobileWarning(false)}
                            className="w-full rounded-xl bg-gray-700 px-6 py-3 font-medium text-white hover:bg-gray-600"
                            stretched
                        >
                            Back to Verification
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-md px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mb-6 flex justify-center">
                        {verificationStatus === "APPROVED" ? (
                            <Image
                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Check%20Mark%20Button.webp"
                                width={120}
                                height={120}
                                alt="Verification Success"
                            />
                        ) : verificationStatus === "DECLINED" ||
                          verificationStatus === "EXPIRED" ||
                          verificationStatus === "ABANDONED" ? (
                            <Image
                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Cross%20Mark.webp"
                                width={120}
                                height={120}
                                alt="Verification Failed"
                            />
                        ) : verificationStatus === "IN_PROGRESS" ||
                          verificationStatus === "IN_REVIEW" ? (
                            <Image
                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Hourglass%20Not%20Done.webp"
                                width={120}
                                height={120}
                                alt="Verification In Progress"
                            />
                        ) : verificationStatus === "KYC_EXPIRED" ? (
                            <Image
                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Passport%20Control.webp"
                                width={120}
                                height={120}
                                alt="Verification Expired"
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

                    {verificationStatus === "APPROVED" ? (
                        <>
                            <h1 className="mb-4 text-3xl font-bold text-green-400">
                                Verification Complete!
                            </h1>
                            <p className="text-lg text-gray-300">
                                Your identity has been successfully verified. Redirecting to
                                subscription...
                            </p>
                        </>
                    ) : verificationStatus === "DECLINED" ? (
                        <>
                            <h1 className="mb-4 text-3xl font-bold text-red-400">
                                Verification Declined
                            </h1>
                            <p className="text-lg text-gray-300">
                                Identity verification was declined. Please contact support or try
                                again.
                            </p>
                        </>
                    ) : verificationStatus === "EXPIRED" || verificationStatus === "ABANDONED" ? (
                        <>
                            <h1 className="mb-4 text-3xl font-bold text-red-400">
                                Verification{" "}
                                {verificationStatus === "EXPIRED" ? "Expired" : "Abandoned"}
                            </h1>
                            <p className="text-lg text-gray-300">
                                {verificationStatus === "EXPIRED"
                                    ? "Your verification session has expired. Please start a new verification."
                                    : "Verification process was abandoned. Please try again."}
                            </p>
                        </>
                    ) : verificationStatus === "KYC_EXPIRED" ? (
                        <>
                            <h1 className="mb-4 text-3xl font-bold text-yellow-400">KYC Expired</h1>
                            <p className="text-lg text-gray-300">
                                Your KYC verification has expired. Please complete verification
                                again.
                            </p>
                        </>
                    ) : verificationStatus === "IN_PROGRESS" ? (
                        <>
                            <h1 className="mb-4 text-3xl font-bold text-blue-400">
                                Verification In Progress
                            </h1>
                            <p className="text-lg text-gray-300">
                                Your verification is being processed. Please continue or wait...
                            </p>
                        </>
                    ) : verificationStatus === "IN_REVIEW" ? (
                        <>
                            <h1 className="mb-4 text-3xl font-bold text-yellow-400">
                                Under Review
                            </h1>
                            <p className="text-lg text-gray-300">
                                Your verification is under manual review. This may take 24-48 hours.
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

                {/* Content Section */}
                <div className="space-y-6">
                    {/* Verification Steps - Only show when user can start verification */}
                    {(verificationStatus === null ||
                        verificationStatus === "NOT_STARTED" ||
                        verificationStatus === "DECLINED" ||
                        verificationStatus === "EXPIRED" ||
                        verificationStatus === "ABANDONED" ||
                        verificationStatus === "KYC_EXPIRED") && (
                        <div className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-orange-600/10 p-4">
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

                    {verificationStatus === "IN_REVIEW" && (
                        <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 animate-pulse rounded-full bg-yellow-400"></div>
                                <div>
                                    <p className="text-sm font-medium text-yellow-400">
                                        Under Manual Review
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Your verification is being reviewed manually (24-48 hours)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {verificationStatus === "KYC_EXPIRED" && (
                        <div className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-orange-600/10 p-4">
                            <div className="flex items-center gap-3">
                                <svg
                                    className="h-6 w-6 text-orange-400"
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
                                    <p className="text-sm font-medium text-orange-400">
                                        KYC Expired
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Your previous verification has expired, please verify again
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop Warning */}
                    {!isMobile &&
                        verificationStatus !== "APPROVED" && (
                            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-left">
                                <div className="flex items-start space-x-3">
                                    <svg
                                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-yellow-400">
                                            Desktop Detected
                                        </p>
                                        <p className="mt-1 text-xs text-yellow-300">
                                            For the best experience, use your mobile device for
                                            verification.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-600/10 p-4">
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

                    {/* Action Buttons - Natural Flow */}
                    <div className="space-y-3 pt-6">
                        {verificationStatus === "APPROVED" ? (
                            <Button
                                onClick={() => router.push("/subscription")}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-lg font-semibold text-white"
                            >
                                Continue to Subscription
                            </Button>
                        ) : verificationStatus === "DECLINED" ||
                          verificationStatus === "EXPIRED" ||
                          verificationStatus === "ABANDONED" ||
                          verificationStatus === "KYC_EXPIRED" ? (
                            <Button
                                onClick={initiateVerification}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-lg font-semibold text-white"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Starting Verification...
                                    </div>
                                ) : (
                                    "Start New Verification"
                                )}
                            </Button>
                        ) : verificationStatus === "IN_PROGRESS" ? (
                            <>
                                {verificationUrl ? (
                                    <Button
                                        onClick={continueVerification}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-lg font-semibold text-white"
                                    >
                                        Continue Verification
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={checkVerificationStatus}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-lg font-semibold text-white"
                                    >
                                        Check Verification Status
                                    </Button>
                                )}
                            </>
                        ) : verificationStatus === "IN_REVIEW" ? (
                            // Show a message indicating the verification is in review
                            <p></p>
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
                </div>
            </div>
        </div>
    );
}
