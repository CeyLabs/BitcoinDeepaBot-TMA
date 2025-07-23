"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { authenticateWithTelegram, saveAuthToStorage } from "@/lib/auth";
import LoadingPage from "@/components/LoadingPage";
import fetchy from "@/lib/fetchy";
import { UserExistsResponse } from "@/lib/types";
import { Button, Subheadline, Title } from "@telegram-apps/telegram-ui";
import Image from "next/image";

export default function OnboardPage() {
    const router = useRouter();
    const { setIsExistingUser, setUser } = useStore();
    const launchParams = useLaunchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [telegramUserData, setTelegramUserData] = useState<any>(null);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true);
                setAuthError(null);

                const initDataRaw = launchParams.initDataRaw;

                if (initDataRaw) {
                    // Extract user data from initData
                    const initData = launchParams.initData;
                    const user = initData?.user;

                    if (user) {
                        setTelegramUserData(user);

                        // Authenticate to get token
                        const authResult = await authenticateWithTelegram(initDataRaw);

                        if (authResult.token) {
                            // Save auth token to localStorage
                            saveAuthToStorage(authResult.token);

                            // Check if user is already registered
                            try {
                                const response = await fetchy.get<UserExistsResponse>(
                                    `/api/user/exists/${user.id}`
                                );

                                if (response.registered) {
                                    // User is registered, redirect to dashboard
                                    setIsExistingUser(true);
                                    setUser({
                                        id: user.id?.toString() || "",
                                        username: user.username || "",
                                        isExisting: true,
                                    });
                                    router.push("/dashboard");
                                    return;
                                }
                            } catch (error) {
                                console.error("Error checking user registration:", error);
                            }

                            // Set user data for new user
                            setUser({
                                id: user.id?.toString() || "",
                                username: user.username || "",
                                isExisting: false,
                            });
                            setIsExistingUser(false);
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
    }, [launchParams, setIsExistingUser, setUser, router]);

    const handleCompleteOnboarding = () => {
        setIsExistingUser(true);
        router.push("/dashboard");
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    if (authError) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-red-500">
                        Authentication Error
                    </h2>
                    <p className="mb-4 text-gray-400">{authError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#202020] p-4">
            <div className="mx-auto max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <section className="flex flex-col items-center justify-center text-center">
                        <Image
                            src="/BDLogo_White.svg"
                            width={130}
                            height={130}
                            alt="Bitcoin Deepa"
                        />
                        <Title weight="2">Welcome to Bitcoin Deepa! 🇱🇰</Title>
                    </section>
                    <Subheadline className="mt-3 text-gray-300">
                        {" "}
                        Your gateway to Bitcoin trading in Sri Lanka
                    </Subheadline>
                </div>

                {/* Features Preview */}
                <div className="mb-8 mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-orange-500/25 border-r-orange-600/25 bg-zinc-900/50 p-4 text-center backdrop-blur-sm">
                        <div className="mb-2 text-2xl">📈</div>
                        <div className="text-sm font-medium text-white">Live Prices</div>
                        <div className="text-xs text-gray-400">Real-time tracking</div>
                    </div>
                    <div className="rounded-xl border border-orange-500/25 border-r-orange-600/25 bg-zinc-900/50 p-4 text-center backdrop-blur-sm">
                        <div className="mb-2 text-2xl">🔒</div>
                        <div className="text-sm font-medium text-white">Secure</div>
                        <div className="text-xs text-gray-400">Bank-level security</div>
                    </div>
                    <div className="rounded-xl border border-orange-500/25 border-r-orange-600/25 bg-zinc-900/50 p-4 text-center backdrop-blur-sm">
                        <div className="mb-2 text-2xl">⚡</div>
                        <div className="text-sm font-medium text-white">Fast Trading</div>
                        <div className="text-xs text-gray-400">Instant transactions</div>
                    </div>
                    <div className="rounded-xl border border-orange-500/25 border-r-orange-600/25 bg-zinc-900/50 p-4 text-center backdrop-blur-sm">
                        <div className="mb-2 text-2xl">🇱🇰</div>
                        <div className="text-sm font-medium text-white">Local Support</div>
                        <div className="text-xs text-gray-400">Sri Lankan team</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Button
                        Component="a"
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
                        href="/subscription"
                    >
                        <span className="flex gap-2">🎯 Choose Your Plan</span>
                    </Button>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                        Join thousands of Sri Lankans already trading Bitcoin
                    </p>
                </div>
            </div>
        </div>
    );
}
