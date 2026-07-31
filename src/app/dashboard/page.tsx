"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBackButton, useLaunchParams } from "@telegram-apps/sdk-react";
import { authenticateWithTelegram, getAuthTokenFromStorage, saveAuthToStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";
import { UserExistsResponse, Subscription } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { RewardsChart } from "@/components/RewardsChart";
import { cn } from "@/lib/cn";
import { VisibleToggle } from "@/components/ui/visible-toggle";
import BottomNavigation from "@/components/bottomNavigation";

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

const PLAN_EMOJIS: Record<string, string> = {
  shrimp: "🦐",
  crab: "🦀",
  shark: "🦈",
  whale: "🐳",
};

function getPlanEmoji(name: string): string {
  return PLAN_EMOJIS[name.toLowerCase()] ?? "₿";
}

function fmtLkr(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtSats(sats: number): string {
  if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(1)}M`;
  if (sats >= 1_000) return `${Math.round(sats / 1_000)}K`;
  return sats.toString();
}

function fmtPrice(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return fmtLkr(value);
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function relativeTime(dateStr: string): string {
  const diff = Math.round(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Today";
  if (diff > 0) return `In ${diff} day${diff !== 1 ? "s" : ""}`;
  return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""} ago`;
}

const MASK = "••••••";

// ─── Shared primitives ────────────────────────────────────────────────────────

function DarkCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[12px] bg-[#0b0f14] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.3)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-normal leading-[14px] text-[#64748b] mb-1.5">{children}</p>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ subscription }: { subscription: Subscription | null | undefined }) {
  return (
    <DarkCard className="px-4 py-4">
      <div className="flex items-stretch gap-0 min-h-[88px]">
        <div className="flex-1 flex flex-col justify-center pr-4 min-w-0">
          <SectionLabel>Active Plan</SectionLabel>
          {subscription ? (
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[22px] leading-none">{getPlanEmoji(subscription.planName)}</span>
                <span className="text-[16px] font-semibold text-[#f1f5f9]">{subscription.planName}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[14px] font-semibold text-[#f1f5f9]">
                  Rs {fmtLkr(subscription.price)}
                </span>
                <span className="text-[12px] text-[#64748b]">
                  /{subscription.planType === "weekly" ? "week" : "month"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-[#475569] mt-1">No active plan</p>
          )}
        </div>

        <div className="w-px bg-[#1e2834] self-stretch" />

        <div className="flex-1 flex flex-col justify-between pl-4 min-w-0">
          <div>
            <SectionLabel>Next Reward Date</SectionLabel>
            {subscription?.endDate ? (
              <>
                <p className="text-[14px] font-semibold text-[#f1f5f9]">{fmtDate(subscription.endDate)}</p>
                <p className="text-[12px] text-[#64748b]">{relativeTime(subscription.endDate)}</p>
              </>
            ) : (
              <p className="text-[14px] text-[#475569]">—</p>
            )}
          </div>
          <div className="mt-3">
            <SectionLabel>Last Reward Date</SectionLabel>
            {subscription?.startDate ? (
              <>
                <p className="text-[14px] font-semibold text-[#f1f5f9]">{fmtDate(subscription.startDate)}</p>
                <p className="text-[12px] text-[#64748b]">{relativeTime(subscription.startDate)}</p>
              </>
            ) : (
              <p className="text-[14px] text-[#475569]">—</p>
            )}
          </div>
        </div>
      </div>
    </DarkCard>
  );
}

// ─── Investment stats card ────────────────────────────────────────────────────

function InvestmentCard({
  dcaSpent,
  dcaSats,
  totalLkr,
  avgBtcPrice,
  visible,
}: {
  dcaSpent: number;
  dcaSats: number;
  totalLkr: number;
  avgBtcPrice: number;
  visible: boolean;
}) {
  const profitLkr = totalLkr - dcaSpent;
  const profitPct = dcaSpent > 0 ? (profitLkr / dcaSpent) * 100 : 0;
  const isProfit = profitLkr >= 0;
  const m = (v: string) => (visible ? v : MASK);

  return (
    <DarkCard>
      <div className="flex divide-x divide-[#1e2834]">
        {/* Left */}
        <div className="flex-1 flex flex-col divide-y divide-[#1e2834]">
          <div className="p-4">
            <SectionLabel>You Invested</SectionLabel>
            <p className="text-[15px] font-semibold text-[#f1f5f9]">
              {m(`LKR ${fmtLkr(dcaSpent)}`)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[12px] text-[#64748b]">₿ {m((dcaSats / 1e8).toFixed(5))}</span>
              <div className="w-px h-3 bg-[#1e2834]" />
              <span className="text-[12px] text-[#64748b]">丰 {m(fmtSats(dcaSats))}</span>
            </div>
          </div>
          <div className="p-4">
            <SectionLabel>Avg Price</SectionLabel>
            <p className="text-[14px] font-medium text-[#f1f5f9]">
              LKR {fmtPrice(avgBtcPrice)}{" "}
              <span className="text-[11px] text-[#64748b]">per BTC</span>
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 flex flex-col divide-y divide-[#1e2834]">
          <div className="p-4">
            <SectionLabel>Current Value</SectionLabel>
            <p className="text-[15px] font-semibold text-[#f1f5f9]">
              {m(`LKR ${fmtLkr(totalLkr)}`)}
            </p>
            {dcaSpent > 0 && (
              <div
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-1.5",
                  isProfit ? "bg-[#22c55e]/15 text-[#22c55e]" : "bg-red-500/15 text-red-400"
                )}
              >
                {isProfit ? "+" : ""}LKR {fmtLkr(Math.abs(profitLkr))} ({isProfit ? "+" : ""}
                {profitPct.toFixed(0)}%)
              </div>
            )}
          </div>
          <div className="p-4">
            <SectionLabel>Current Price</SectionLabel>
            {avgBtcPrice > 0 ? (
              <p className="text-[14px] font-medium text-[#f1f5f9]">
                LKR {fmtPrice(avgBtcPrice)}{" "}
                <span className="text-[11px] text-[#64748b]">per BTC</span>
              </p>
            ) : (
              <p className="text-[14px] text-[#475569]">—</p>
            )}
          </div>
        </div>
      </div>
    </DarkCard>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const router = useRouter();
  const { setIsExistingUser, setUser } = useStore();
  const launchParams = useLaunchParams();
  const backButton = useBackButton();

  const [authError, setAuthError] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<{ username?: string } | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const authToken = getAuthTokenFromStorage();

  const { data: summary, isLoading } = useQuery<DCSummary>({
    queryKey: queryKeys.walletSummary,
    queryFn: async () => {
      const res = await fetch("/api/transaction/dca-summary", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch wallet summary");
      return res.json();
    },
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
  });

  const { data: subscription } = useQuery<Subscription | null>({
    queryKey: ["subscription-current"],
    queryFn: async () => {
      const res = await fetch("/api/subscription/current", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!authToken,
  });

  useEffect(() => {
    backButton.show();
    const onBack = () => router.push("/");
    backButton.on("click", onBack);
    return () => {
      backButton.off("click", onBack);
      backButton.hide();
    };
  }, [backButton, router]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setAuthError(null);
        const initDataRaw = launchParams.initDataRaw;
        if (!initDataRaw) { setAuthError("No Telegram data available"); return; }
        const user = launchParams.initData?.user;
        if (!user) { setAuthError("No user data from Telegram"); return; }
        setTelegramUser(user);
        const authResult = await authenticateWithTelegram(initDataRaw);
        if (!authResult.token) { setAuthError("Authentication failed"); return; }
        saveAuthToStorage(authResult.token);
        const response = await fetchy.get<UserExistsResponse>(`/api/user/exists/${user.id}`);
        if (response.registered) {
          setIsExistingUser(true);
          setUser({ id: user.id?.toString() ?? "", username: user.username ?? "", isExisting: true });
        } else {
          setIsExistingUser(false);
          router.push("/onboard");
        }
      } catch {
        setAuthError("Authentication failed. Please try again.");
      }
    };
    initAuth();
  }, [launchParams, setIsExistingUser, setUser, router]);

  useEffect(() => {
    if (!authToken) return;
    fetch("/api/user/kyc/status", {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data && data.status !== "APPROVED") router.push("/verification"); })
      .catch(() => {});
  }, [authToken, router]);

  const totalLkr = summary
    ? Number(
        typeof summary.total_lkr === "string"
          ? summary.total_lkr.replace(/,/g, "")
          : summary.total_lkr
      )
    : 0;
  const totalSats = summary?.total_balance ?? 0;
  const dcaSpent = summary?.dca.spent ?? 0;
  const dcaSats = summary?.dca.balance ?? 0;
  const avgBtcPrice = summary?.dca.avg_btc_price ?? 0;
  const change24h = summary?.["24_hr_change"] ?? 0;
  const changeLkr = (change24h / 100) * totalLkr;
  const initials = telegramUser?.username?.slice(0, 2).toUpperCase() ?? "BD";

  const mask = (v: string) => (balanceVisible ? v : MASK);

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1b2027] p-4">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-400">Authentication Error</h2>
          <p className="mb-4 text-sm text-[#64748b]">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[#fa7119] px-5 py-2.5 text-[15px] font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b2027]">
      <main className="mx-auto max-w-[390px] px-4 pb-32 space-y-3">

        {/* Top bar */}
        <div className="flex items-center justify-between pt-4 pb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffb14c]">
            <span className="text-[12px] font-extrabold text-white">{initials}</span>
          </div>
          <VisibleToggle
            dark
            visible={balanceVisible}
            onToggle={() => setBalanceVisible((v) => !v)}
          />
        </div>

        {/* Total Balance */}
        <div className="flex flex-col items-center py-4 text-center">
          <p className="text-[13px] font-normal leading-[16px] text-[#64748b] mb-2">
            Total VALUE &nbsp;·&nbsp; LKR
          </p>
          {isLoading ? (
            <div className="h-12 w-48 rounded-lg bg-white/5 animate-pulse mb-3" />
          ) : (
            <p className="text-[40px] font-bold leading-[46px] text-[#f1f5f9] mb-3">
              {mask(`≈ LKR ${fmtLkr(totalLkr)}`)}
            </p>
          )}
          <div className="flex items-center gap-2 text-[13px] text-[#64748b] mb-3">
            <span>₿ {mask((totalSats / 1e8).toFixed(6))} BTC</span>
            <div className="size-1 rounded-full bg-[#64748b]" />
            <span>丰 {mask(fmtSats(totalSats))} SATS</span>
          </div>
          {summary && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium",
                change24h >= 0 ? "bg-[#22c55e]/15 text-[#22c55e]" : "bg-red-500/15 text-red-400"
              )}
            >
              <span>{change24h >= 0 ? "↑" : "↙"}</span>
              <span>24h Change</span>
              <span>
                LKR {fmtLkr(Math.abs(changeLkr))} ({change24h >= 0 ? "+" : ""}
                {change24h.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Active Plan */}
        <PlanCard subscription={subscription} />

        {/* Investment Stats */}
        <InvestmentCard
          dcaSpent={dcaSpent}
          dcaSats={dcaSats}
          totalLkr={totalLkr}
          avgBtcPrice={avgBtcPrice}
          visible={balanceVisible}
        />

        {/* Reward Portfolio Chart */}
        <DarkCard className="p-4">
          <p className="text-[15px] font-semibold text-[#f1f5f9] text-center mb-4">
            Reward Portfolio Performance
          </p>
          <RewardsChart authToken={authToken} avgBtcPrice={avgBtcPrice} />
        </DarkCard>

      </main>
      <BottomNavigation />
    </div>
  );
}
