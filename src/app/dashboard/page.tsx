"use client";

import { useStore } from "@/lib/store";
import { MdSettings, MdApps, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { IoMdSend, IoMdDownload, IoMdTime, IoMdQrScanner } from "react-icons/io";
import { FaUserPlus } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { authenticateWithTelegram, saveAuthToStorage } from "@/lib/auth";
import LoadingPage from "@/components/LoadingPage";
import fetchy from "@/lib/fetchy";
import { UserExistsResponse } from "@/lib/types";
import { toast } from "sonner";

export default function WalletPage() {
    const router = useRouter();
    const { wallet, rewards, isExistingUser, setIsExistingUser, setUser } = useStore();
    const launchParams = useLaunchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [telegramUserData, setTelegramUserData] = useState<any>(null);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        // Hide welcome banner after 5 seconds
        if (showWelcome) {
            const timer = setTimeout(() => setShowWelcome(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showWelcome]);

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
                            saveAuthToStorage(authResult.token);

                            // Check if user is registered in the backend
                            try {
                                const response = await fetchy.get<UserExistsResponse>(
                                    `/api/user/exists/${user.id}`
                                );

                                if (response.registered) {
                                    // User is registered, set as existing user and show welcome back
                                    setIsExistingUser(true);
                                    setShowWelcome(true);

                                    // Set user data
                                    setUser({
                                        id: user.id?.toString() || "",
                                        username: user.username || "",
                                        isExisting: true,
                                    });
                                    return;
                                } else {
                                    // User is not registered, redirect to onboarding
                                    setIsExistingUser(false);
                                    router.push("/onboard");
                                    return;
                                }
                            } catch (error) {
                                console.error("Error checking user registration:", error);
                                // If check fails, redirect to onboarding for safety
                                router.push("/onboard");
                                return;
                            }
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

    useEffect(() => {
        if (showWelcome && telegramUserData?.firstName) {
            toast(
                <div className="text-center">
                    <h3 className="mb-1 flex items-center justify-center gap-2 text-lg font-semibold text-green-400">
                        <span className="text-xl">🎉</span> Welcome back to Bitcoin Deepa!
                    </h3>
                    <p className="text-sm text-green-300">{`Good to see you again!`}</p>
                </div>,
                {
                    duration: 5000,
                    className:
                        "backdrop-blur-md bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-lg px-4 py-3 shadow-lg",
                    style: {
                        background: "rgba(22, 163, 74, 0.2)",
                        color: "#fff",
                        border: "1px solid rgba(34,197,94,0.3)",
                    },
                }
            );
            setShowWelcome(false);
        }
    }, [showWelcome, telegramUserData]);

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
        <main className="pb-20">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <button className="rounded-lg bg-gray-800 p-2">
                    <MdSettings className="text-xl text-gray-400" />
                </button>
                <button className="rounded-lg bg-gray-800 p-2">
                    <MdApps className="text-xl text-gray-400" />
                </button>
            </div>

            {/* Balance Section */}
            <div className="mb-8 text-center">
                <p className="mb-2 text-gray-400">Balance</p>
                <h1 className="mb-2 text-4xl font-bold">${wallet.balance.toFixed(2)}</h1>
                <div className="flex items-center justify-center gap-2">
                    <span
                        className={`text-sm ${wallet.change24h < 0 ? "text-red-500" : "text-green-500"}`}
                    >
                        {wallet.change24h < 0 ? "-" : "+"}${Math.abs(wallet.change24h).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                        {wallet.changePercent < 0 ? (
                            <MdTrendingDown className="text-red-500" />
                        ) : (
                            <MdTrendingUp className="text-green-500" />
                        )}
                        <span
                            className={`text-sm ${wallet.changePercent < 0 ? "text-red-500" : "text-green-500"}`}
                        >
                            {Math.abs(wallet.changePercent).toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Rewards Banner */}
            {rewards.withdrawable > 0 && (
                <div className="mb-6 rounded-lg border border-orange-500/30 bg-gradient-to-r from-orange-600/20 to-orange-500/20 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-orange-400">Pending Rewards</h3>
                            <p className="text-2xl font-bold text-orange-500">
                                {rewards.withdrawable} sats
                            </p>
                        </div>
                        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700">
                            Claim
                        </button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="mb-8 flex justify-between">
                {[
                    { icon: IoMdSend, label: "Send", color: "bg-gray-800" },
                    { icon: IoMdDownload, label: "Receive", color: "bg-gray-800" },
                    {
                        icon: FaUserPlus,
                        label: "Invite",
                        color: "bg-gray-800",
                        badge: "Reward",
                        link: "/invite",
                    },
                    { icon: IoMdTime, label: "Activity", color: "bg-gray-800" },
                    { icon: IoMdQrScanner, label: "Scan", color: "bg-gray-800" },
                ].map((action, index) => (
                    <div key={index} className="flex flex-col items-center">
                        {action.link ? (
                            <Link
                                href={action.link}
                                className={`relative rounded-full p-4 ${action.color} mb-2`}
                            >
                                <action.icon className="text-xl text-orange-500" />
                                {action.badge && (
                                    <div className="absolute -right-1 -top-1 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                                        {action.badge}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <div className={`relative rounded-full p-4 ${action.color} mb-2`}>
                                <action.icon className="text-xl text-orange-500" />
                                {action.badge && (
                                    <div className="absolute -right-1 -top-1 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                                        {action.badge}
                                    </div>
                                )}
                            </div>
                        )}
                        <span className="text-xs text-gray-400">{action.label}</span>
                    </div>
                ))}
            </div>

            {/* Assets */}
            <div className="space-y-3">
                {wallet.assets.map((asset) => (
                    <div
                        key={asset.symbol}
                        className="flex items-center justify-between rounded-lg bg-gray-800/50 p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700">
                                <span className="text-lg">{asset.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-medium">{asset.symbol}</h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">
                                        ${asset.price.toFixed(asset.symbol === "BTC" ? 2 : 6)}
                                    </span>
                                    <span
                                        className={`${asset.changePercent < 0 ? "text-red-500" : "text-green-500"}`}
                                    >
                                        {asset.changePercent > 0 ? "+" : ""}
                                        {asset.changePercent.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">
                                {asset.symbol === "SATS"
                                    ? asset.balance.toLocaleString()
                                    : asset.symbol === "LKR"
                                      ? asset.balance.toLocaleString()
                                      : asset.balance.toFixed(asset.symbol === "BTC" ? 8 : 2)}
                            </p>
                            <p className="text-sm text-gray-400">${asset.balanceUSD.toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
