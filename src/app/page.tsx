"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import { Badge, Button, Cell, Navigation, Progress, Title } from "@telegram-apps/telegram-ui";
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
        <p className="text-[22px] font-bold text-[#1b2027] tabular-nums dark:text-white">
          {count.toLocaleString()}
          <span className="dark:text-muted-foreground pl-1 text-sm font-normal text-[#64748b]">
            Joined
          </span>
        </p>
        <p className="text-muted-foreground text-sm font-medium tabular-nums dark:text-[#64748b]">
          /{currentTierMax.toLocaleString()}
        </p>
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

function UserScreen({ isExisting }: { isExisting: boolean }) {
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
        <Link href="/dashboard?tab=wallet" className="block">
          <Button mode="filled" size="l" stretched style={{ borderRadius: "12px" }}>
            {isExisting ? "Open My Wallet" : "Start Using Wallet"}
          </Button>
        </Link>

        <Link href="/dashboard/plans" className="block">
          <Cell
            before={<Image src="/emoji/bitcoin.webp" alt="Bitcoin" width={40} height={40} />}
            after={<Navigation />}
            style={{ "--tgui--cell--middle--padding": "12px 0" } as React.CSSProperties}
            className="gap-2! rounded-[12px] border border-transparent bg-white px-4! shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] transition-shadow duration-150 hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.10)] focus-visible:ring-2 focus-visible:ring-[#fa7119]/50 focus-visible:outline-none dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.4)]"
          >
            <p className="flex flex-col items-start pl-1 font-semibold text-[#1b2027] dark:text-white">
              {isExisting ? "Manage My Plans" : "Subscribe to a Plan"}
              <span className="dark:text-muted-foreground text-sm font-normal text-[#64748b]">
                {isExisting
                  ? "View, extend or change plans"
                  : "Choose Monthly or yearly subscriptions"}
              </span>
            </p>
          </Cell>
        </Link>

        {/* Gifting isn't launched yet (see GiftPlansComingSoon) — disabled, not linked. */}
        <Cell
          before={<Image src="/emoji/gift.webp" alt="Gift" width={40} height={40} />}
          readOnly
          aria-disabled="true"
          tabIndex={-1}
          style={{ "--tgui--cell--middle--padding": "12px 0" } as React.CSSProperties}
          className="pointer-events-none gap-2! rounded-[12px] border border-transparent bg-white px-4! opacity-60 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)]"
        >
          <div className="flex flex-col items-start pl-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[#1b2027] dark:text-white">Send a Gift</p>
              <Badge type="number" mode="gray">
                Coming Soon
              </Badge>
            </div>
            <span className="dark:text-muted-foreground text-sm font-normal text-[#64748b]">
              Send a bitcoin subscription to a friend
            </span>
          </div>
        </Cell>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <Link
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-[15px] font-semibold"
        >
          {isExisting ? "Open Telegram Community" : "Join Our Community"}
        </Link>
        <p className="text-muted-foreground text-[13px]">@{TELEGRAM_BOT_USERNAME}</p>
      </div>
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

  return (
    <PageShell>
      <UserScreen isExisting={isExisting} />
    </PageShell>
  );
}
