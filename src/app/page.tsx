"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import { Button, Cell, Navigation, Progress, Title } from "@telegram-apps/telegram-ui";
import { useTheme } from "@/app/context/theme";
import { useStore } from "@/lib/store";
import { getAuthTokenFromStorage, getIsExistingUserFromStorage } from "@/lib/auth";
import { TELEGRAM_BOT_URL, TELEGRAM_BOT_USERNAME } from "@/lib/constants";
import { useRegisterTelegramUser } from "@/hooks/query/useRegisterTelegramUser";
import { useUserCount } from "@/hooks/query/useUserCount";

// ─── Shared progress bar ────────────────────────────────────────────────────

const tierMaxCounts = [100, 200, 500, 1000, 2500, 5000, 10000];

function getCurrentTierMax(n: number): number {
  for (const max of tierMaxCounts) {
    if (n <= max) return max;
  }
  return 10000;
}

function UserProgress() {
  const { count } = useUserCount();

  const currentTierMax = getCurrentTierMax(count);
  const progressPct = Math.min((count / currentTierMax) * 100, 100);

  return (
    <div className="w-full space-y-2">
      <Progress value={progressPct} style={{ height: "8px" }} />
      <div className="flex w-full items-baseline justify-between">
        <p className="text-[22px] font-bold tabular-nums text-[#1b2027] dark:text-white">
          {count.toLocaleString()}
          <span className="pl-1 text-sm font-normal text-[#64748b] dark:text-muted-foreground">Joined</span>
        </p>
        <p className="text-sm font-medium tabular-nums text-muted-foreground dark:text-[#64748b]">/{currentTierMax.toLocaleString()}</p>
      </div>
    </div>
  );
}

// ─── Shared page shell ───────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-5 dark:bg-[#1b2027]">
      {/* Logo + heading slot */}
      <section className="flex flex-col items-center justify-center text-center">
        <div className="relative mb-5 h-[150px] w-[220px]">
          <Image
            src={isDark ? "/BDLogo_White.svg" : "/BDLogo_Black.svg"}
            alt="Bitcoin Deepa"
            fill
            priority
            sizes="220px"
            className="object-contain"
          />
        </div>
        {children}
      </section>
    </main>
  );
}

// ─── User screen (new + existing share everything but copy/icons) ─────────────

function UserScreen({ isExisting, onAction }: { isExisting: boolean; onAction: () => void }) {
  return (
    <div className="flex w-full flex-col">
      <Title level="2" weight="2" className="max-w-sm self-center text-center leading-snug">
        {isExisting ? (
          <>
            Welcome Back!
            <br />
            You&apos;re Already a Member
          </>
        ) : (
          "Join Sri Lanka's Fastest Growing Bitcoin Community"
        )}
      </Title>

      <div className="mt-6 mb-8">
        <UserProgress />
      </div>

      <div className="space-y-3">
        <Button mode="filled" size="l" stretched onClick={onAction} style={{ borderRadius: "12px" }}>
          {isExisting ? "Open My Wallet" : "Start Using Wallet"}
        </Button>

        <Cell
          before={<Image src="/emoji/bitcoin.svg" alt="Bitcoin" width={40} height={40}/>}
          after={<Navigation />}
          onClick={onAction}
          style={{ "--tgui--cell--middle--padding": "12px 0" } as React.CSSProperties}
          className="gap-2! px-4! rounded-[12px] border border-transparent bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] transition-shadow duration-150 hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa7119]/50 dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.4)]"
        >
          {/* {isExisting ? "Manage My Plans" : "Subscribe to a Plan"} */}
           <p className="flex flex-col items-start font-semibold text-[#1b2027] dark:text-white pl-1">
            {isExisting ? "Manage My Plans" : "Subscribe to a Plan"}
            <span className="text-sm font-normal text-[#64748b] dark:text-muted-foreground">{isExisting ? "View, extend or change plans" : "Choose Monthly or yearly subscriptions"}</span>
          </p>
        </Cell>

        <Cell
          before={<Image src="/emoji/gift.svg" alt="Gift" width={40} height={40} />}
          // subtitle="Send a bitcoin subscription to a friend"
          after={<Navigation />}
          onClick={() => window.open(TELEGRAM_BOT_URL, "_blank")}
          style={{ "--tgui--cell--middle--padding": "12px 0" } as React.CSSProperties}
          className="gap-2! px-4! rounded-[12px] border border-transparent bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] transition-shadow duration-150 hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa7119]/50 dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.4)]"
        >
          <p className="flex flex-col items-start font-semibold text-[#1b2027] dark:text-white pl-1">
            Send a Gift
            <span className="text-sm font-normal text-[#64748b] dark:text-muted-foreground">Send a bitcoin subscription to a friend</span>
          </p>

        </Cell>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <Link
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-semibold text-primary"
        >
          {isExisting ? "Open Telegram Community" : "Join Our Community"}
        </Link>
        <p className="text-[13px] text-muted-foreground">@{TELEGRAM_BOT_USERNAME}</p>
      </div>

      {isExisting && (
        <div className="mt-6 flex justify-center">
          <Link href="/dev" className="text-xs text-black underline">
            Component Preview (Dev)
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const initLaunchParams = useLaunchParams().initData;
  const launchParams = useLaunchParams();
  const initData = useInitData();
  const { setUserID, isExistingUser } = useStore();
  const [isExisting, setIsExisting] = useState(false);

  const authData = useMemo(() => {
    return initLaunchParams || initData;
  }, [initLaunchParams, initData]);

  useRegisterTelegramUser(authData, launchParams);

  useEffect(() => {
    setUserID(authData?.user?.id?.toString() || "");
  }, [authData, setUserID]);

  useEffect(() => {
    const token = getAuthTokenFromStorage();
    const existing = isExistingUser || getIsExistingUserFromStorage();
    if (token || existing) {
      setIsExisting(true);
    }
  }, [isExistingUser]);

  // const goToDashboard = () => router.push("/dashboard");
  const goToDashboard = () => {};

  return (
    <PageShell>
      <UserScreen isExisting={isExisting} onAction={goToDashboard} />
    </PageShell>
  );
}
