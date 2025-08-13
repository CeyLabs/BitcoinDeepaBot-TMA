"use client";

import { useStore } from "@/lib/store";
import { MdSettings, MdNotifications, MdQrCode, MdRefresh } from "react-icons/md";
import { IoMdSend, IoMdDownload } from "react-icons/io";
import { FaEllipsisH } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBackButton, useLaunchParams } from "@telegram-apps/sdk-react";
import { authenticateWithTelegram, getAuthTokenFromStorage, saveAuthToStorage } from "@/lib/auth";
import BalanceCardSkeleton from "@/components/skeletons/BalanceCardSkeleton";
import ChartSkeleton from "@/components/skeletons/ChartSkeleton";
import fetchy from "@/lib/fetchy";
import { UserExistsResponse } from "@/lib/types";
import { toast } from "sonner";
import Image from "next/image";
import { formatLargeNumber } from "@/lib/formatters";
import { LuArrowDownRight, LuArrowUpRight } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { DCAChart } from "@/components/DCAChart";

interface DCSummary {
    dca: {
        balance: number;
        spent: number;
        avg_btc_price: number;
    };
    total_balance: number;
    total_lkr: string;
    currency: string;
    "24_hr_change": number;
}

const handleRefreshWallet = async (refetchSummary: () => Promise<any>) => {
    try {
        await refetchSummary();
        toast("Wallet refreshed successfully", {
            className: "bg-gray-900 text-white",
        });
    } catch (error) {
        toast("Failed to refresh wallet", {
            className: "bg-gray-900 text-white",
        });
    }
};

export default function WalletPage() {
    const router = useRouter();
    const { wallet, isExistingUser, setIsExistingUser, setUser } = useStore();
    const launchParams = useLaunchParams();
    const backButton = useBackButton();
    const [authError, setAuthError] = useState<string | null>(null);
    const [telegramUserData, setTelegramUserData] = useState<any>(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const authToken = getAuthTokenFromStorage();

    const {
        data: summary,
        isLoading,
        error: summaryError,
        refetch: refetchSummary,
    } = useQuery<DCSummary>({
        queryKey: queryKeys.walletSummary,
        queryFn: async () => {
            const res = await fetch(`/api/transaction/dca-summary`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch wallet summary");
            return res.json();
        },
        enabled: !!authToken,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        backButton.show();

        const handleBackClick = () => {
            router.push("/");
        };

        backButton.on("click", handleBackClick);

        return () => {
            backButton.off("click", handleBackClick);
            backButton.hide();
        };
    }, [backButton, router]);

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
            }
        };

        initializeAuth();
    }, [launchParams, setIsExistingUser, setUser, router]);

    useEffect(() => {
        if (summaryError) {
            toast.error(
                summaryError instanceof Error ? summaryError.message : String(summaryError)
            );
        }
    }, [summaryError]);

    useEffect(() => {
        const checkKycStatus = async () => {
            if (authToken) {
                try {
                    const res = await fetch(`/api/user/kyc/status`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.status !== "APPROVED") {
                            router.push("/verification");
                        }
                    }
                } catch (error) {
                    console.error("Error checking KYC status:", error);
                }
            }
        };

        checkKycStatus();
    }, [authToken, router]);

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
                        className="rounded-xl bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <main className="pb-20">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
                            <Image
                                src={telegramUserData?.photoUrl || "/profile.png"}
                                alt="User Avatar"
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* <button
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 opacity-50"
                            type="button"
                            onClick={() =>
                                toast("This feature is not available yet.", {
                                    className: "bg-gray-900 text-white",
                                })
                            }
                        >
                            <MdQrCode className="text-xl text-gray-400" />
                        </button> */}
                        {/* <button
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800"
                            onClick={() => setShowNotifications((prev) => !prev)}
                        >
                            <MdNotifications className="text-xl text-gray-400" />
                        </button> */}
                        {showNotifications && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                                <div className="relative mx-3 w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-8 shadow-2xl">
                                    <button
                                        className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-orange-500"
                                        onClick={() => setShowNotifications(false)}
                                        aria-label="Close"
                                    >
                                        &times;
                                    </button>
                                    <h3 className="mb-4 text-center text-2xl font-semibold text-white">
                                        Notifications
                                    </h3>
                                    <div className="py-12 text-center text-lg text-gray-400">
                                        No notifications
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Balance Card */}
                {isLoading ? (
                    <BalanceCardSkeleton />
                ) : (
                    <div className="mb-8 rounded-3xl border border-gray-700 bg-gradient-to-r from-gray-600/20 to-gray-500/20 p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Current balance</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 transition-colors hover:bg-gray-600"
                                    onClick={() => handleRefreshWallet(refetchSummary)}
                                    disabled={isLoading}
                                >
                                    <MdRefresh
                                        className={`text-lg text-gray-400 ${isLoading ? "animate-spin" : ""}`}
                                    />
                                </button>
                                {/* <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                                <MdSettings className="text-lg text-gray-400" />
                            </button> */}
                            </div>
                        </div>

                        {summary ? (
                            <div className="mb-6">
                                <h1 className="mb-6 text-4xl font-bold text-white">
                                    {formatLargeNumber(summary.total_balance)}{" "}
                                    <span className="text-base font-medium text-orange-400">
                                        sats
                                    </span>
                                    <span className="ml-3 rounded-md bg-blue-400/10 px-2 py-1 text-sm text-blue-400">
                                        ≈ රු.{" "}
                                        {summary.total_lkr
                                            ? formatLargeNumber(
                                                  Number(summary.total_lkr.replace(/,/g, ""))
                                              )
                                            : "0"}
                                    </span>
                                </h1>

                                {/* Wallet Analytics Dashboard */}
                                <div className="mb-4 rounded-xl border-gray-800/50">
                                    <div className="mb-3 text-sm font-medium text-gray-300">
                                        Balance Distribution
                                    </div>

                                    {/* Visual Progress Representation */}
                                    <div className="mb-4">
                                        <div className="flex h-3 overflow-hidden rounded-full bg-gray-700">
                                            <div
                                                className="bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                                                style={{
                                                    width: `${(summary.dca.balance / summary.total_balance) * 100}%`,
                                                }}
                                            ></div>
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                                                style={{
                                                    width: `${((summary.total_balance - summary.dca.balance) / summary.total_balance) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Compact Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border-l-4 border-orange-500 bg-orange-500/10 p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs font-medium uppercase text-orange-300">
                                                        Membership <br /> Rewards
                                                    </div>
                                                    <div className="text-lg font-bold text-white">
                                                        {formatLargeNumber(summary.dca.balance)}
                                                    </div>
                                                    <div className="text-xs text-orange-400">
                                                        {(
                                                            (summary.dca.balance /
                                                                summary.total_balance) *
                                                            100
                                                        ).toFixed(1)}
                                                        % of total
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border-l-4 border-green-500 bg-green-500/10 p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs font-medium uppercase text-green-300">
                                                        Wallet
                                                        <br /> Balance
                                                    </div>
                                                    <div className="text-lg font-bold text-white">
                                                        {formatLargeNumber(
                                                            summary.total_balance -
                                                                summary.dca.balance
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-green-400">
                                                        {(
                                                            ((summary.total_balance -
                                                                summary.dca.balance) /
                                                                summary.total_balance) *
                                                            100
                                                        ).toFixed(1)}
                                                        % of total
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats Row */}
                                    <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-700/30 p-3">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400">DCA Spent</div>
                                            <div className="text-sm font-semibold text-white">
                                                රු. {formatLargeNumber(summary.dca.spent)}
                                            </div>
                                        </div>
                                        <div className="h-8 w-px bg-gray-600"></div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400">Avg Price</div>
                                            <div className="text-sm font-semibold text-white">
                                                රු. {formatLargeNumber(summary.dca.avg_btc_price)}
                                            </div>
                                        </div>
                                        <div className="h-8 w-px bg-gray-600"></div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-400">Total BTC</div>
                                            <div className="text-sm font-semibold text-white">
                                                {(summary.total_balance / 100_000_000).toFixed(6)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Portfolio Performance Section */}
                                {/* 24hr P&L */}
                                <div className="rounded-xl bg-gray-700/40 p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                    summary["24_hr_change"] >= 0
                                                        ? "bg-green-500/20"
                                                        : "bg-red-500/20"
                                                }`}
                                            >
                                                <span
                                                    className={`text-sm font-bold ${
                                                        summary["24_hr_change"] >= 0
                                                            ? "text-green-400"
                                                            : "text-red-400"
                                                    }`}
                                                >
                                                    {summary["24_hr_change"] >= 0 ? (
                                                        <LuArrowUpRight />
                                                    ) : (
                                                        <LuArrowDownRight />
                                                    )}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">24h P&L</div>
                                                <div
                                                    className={`text-lg font-bold ${
                                                        summary["24_hr_change"] >= 0
                                                            ? "text-green-400"
                                                            : "text-red-400"
                                                    }`}
                                                >
                                                    {summary["24_hr_change"] >= 0 ? "+" : ""}රු.{" "}
                                                    {formatLargeNumber(
                                                        (summary["24_hr_change"] *
                                                            Number(
                                                                summary.total_lkr.replace(/,/g, "")
                                                            )) /
                                                            100
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">Change</div>
                                            <div
                                                className={`text-sm font-semibold ${
                                                    summary["24_hr_change"] >= 0
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }`}
                                            >
                                                {summary["24_hr_change"] >= 0 ? "+" : ""}
                                                {summary["24_hr_change"].toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <h1 className="mb-2 text-4xl font-bold text-white">
                                    $
                                    {wallet.balance.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-sm font-medium ${
                                            wallet.change24h < 0 ? "text-red-500" : "text-green-500"
                                        }`}
                                    >
                                        {wallet.change24h < 0 ? "-" : "+"}$
                                        {Math.abs(wallet.change24h).toFixed(2)}
                                    </span>
                                    <span
                                        className={`text-sm ${
                                            wallet.changePercent < 0
                                                ? "text-red-500"
                                                : "text-green-500"
                                        }`}
                                    >
                                        ({wallet.changePercent > 0 ? "+" : ""}
                                        {wallet.changePercent.toFixed(2)}%)
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {/* <div className="flex justify-between">
                        {[
                            { icon: IoMdSend, label: "Send", unavailable: true },
                            { icon: IoMdDownload, label: "Receive", unavailable: true },
                            { icon: IoMdDownload, label: "Swap", unavailable: true },
                            { icon: FaEllipsisH, label: "More", link: "dashboard/history" },
                        ].map((action, index) => (
                            <div key={index} className="flex flex-col items-center">
                                {action.link ? (
                                    <Link
                                        href={action.link}
                                        className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 transition-colors hover:bg-gray-600"
                                    >
                                        <action.icon className="text-xl text-orange-500" />
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 transition-colors hover:bg-gray-600 ${
                                            action.unavailable ? "opacity-50" : ""
                                        }`}
                                        onClick={
                                            action.unavailable
                                                ? () => {
                                                      if (action.label === "Send") {
                                                          toast(
                                                              "Use /send command in bot to send sats",
                                                              {
                                                                  className:
                                                                      "bg-gray-900 text-white",
                                                              }
                                                          );
                                                      } else if (action.label === "Receive") {
                                                          toast(
                                                              "Use /receive command in bot to receive sats",
                                                              {
                                                                  className:
                                                                      "bg-gray-900 text-white",
                                                              }
                                                          );
                                                      } else {
                                                          toast(
                                                              "This feature is not available yet.",
                                                              {
                                                                  className:
                                                                      "bg-gray-900 text-white",
                                                              }
                                                          );
                                                      }
                                                  }
                                                : undefined
                                        }
                                    >
                                        <action.icon className="text-xl text-orange-500" />
                                    </button>
                                )}
                                <span
                                    className={`text-xs ${
                                        action.unavailable ? "text-gray-500" : "text-gray-400"
                                    }`}
                                >
                                    {action.label}
                                </span>
                            </div>
                        ))}
                    </div> */}
                    </div>
                )}

                {/* DCA Chart Section */}
                {isLoading ? (
                    <ChartSkeleton />
                ) : (
                    <DCAChart authToken={authToken} avgBtcPrice={summary?.dca.avg_btc_price} />
                )}
            </main>
        </div>
    );
}
