"use client";

import { useEffect, useState } from "react";
import { SlowLoadNotice } from "@/components/SlowLoadNotice";
import { Logo } from "@/components/ui/logo";
import { Bone } from "@/components/ui/bone";
import Image from "next/image";
import { cn } from "cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cell, CellChevron } from "@/components/ui/cell";
import { Progress } from "@/components/ui/progress";
import { Title } from "@/components/ui/title";
import { getAuthTokenFromStorage, getIsExistingUserFromStorage } from "@/lib/auth";
import { TELEGRAM_BOT_URL, TELEGRAM_BOT_USERNAME } from "@/lib/constants";
import { useRegisterTelegramUser } from "@/hooks/query/useRegisterTelegramUser";
import { useUserCount } from "@/hooks/query/useUserCount";
import { usePlatform } from "@/platform";
import { useSession } from "@/hooks/useSession";
import BrowserLoginScreen from "@/components/auth/BrowserLoginScreen";

// ─── Shared progress bar ────────────────────────────────────────────────────

const tierMaxCounts = [100, 200, 500, 1000, 2500, 5000, 10000];

function getCurrentTierMax(n: number): number {
  for (const max of tierMaxCounts) {
    if (n <= max) return max;
  }
  return 10000;
}

function UserProgress() {
  const { count, isLoading } = useUserCount();

  const currentTierMax = getCurrentTierMax(count);
  const progressPct = Math.min((count / currentTierMax) * 100, 100);

  // Avoid flashing "0 Joined" / "/100" before the count has loaded.
  if (isLoading) {
    return (
      <div className="w-full space-y-2">
        <Progress value={0} className="h-2" />
        <div className="flex w-full items-baseline justify-between">
          <Bone className="h-7 w-28" />
          <Bone className="h-4 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Progress value={progressPct} className="h-2" />
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

/**
 * Logo + content. With no children it's the start screen (platform detection,
 * sign-in, redirect): it appears only after 300ms so fast loads never flash
 * it, the logo breathes slowly, and a retry shows up if it takes too long.
 * The logo stays in the same spot when the real content arrives.
 */
function PageShell({ children }: { children?: React.ReactNode }) {
  const loading = !children;
  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-5 dark:bg-[#1b2027]">
      <section
        aria-busy={loading || undefined}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          loading && "animate-appear motion-reduce:animate-none"
        )}
      >
        <div
          className={cn(
            "relative mb-5 h-[150px] w-[220px]",
            loading && "animate-breathe motion-reduce:animate-none"
          )}
        >
          <Logo priority />
        </div>
        {loading ? <SlowLoadNotice /> : children}
      </section>
    </main>
  );
}

// ─── User screen (new + existing share everything but copy/icons) ─────────────

function UserScreen({ isExisting }: { isExisting: boolean }) {
  const { openTelegramLink } = usePlatform();
  return (
    <div className="flex w-full flex-col">
      <Title className="max-w-sm self-center text-center leading-snug">
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
          <Button size="lg" className="w-full rounded-[12px]">
            {isExisting ? "Open My Wallet" : "Start Using Wallet"}
          </Button>
        </Link>

        <Link href="/dashboard/plans" className="block">
          <Cell
            before={<Image src="/emoji/bitcoin.webp" alt="Bitcoin" width={40} height={40} />}
            after={<CellChevron />}
            className="gap-2 rounded-[12px] border border-transparent bg-white px-4 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] transition-shadow duration-150 [--cell-py:12px] hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.10)] focus-visible:ring-2 focus-visible:ring-[#fa7119]/50 focus-visible:outline-none dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.4)]"
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
          aria-disabled="true"
          tabIndex={-1}
          className="pointer-events-none gap-2 rounded-[12px] border border-transparent bg-white px-4 opacity-60 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] [--cell-py:12px] dark:border-white/6 dark:bg-[#0B0F14] dark:shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)]"
        >
          <div className="flex flex-col items-start pl-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[#1b2027] dark:text-white">Send a Gift</p>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <span className="dark:text-muted-foreground text-sm font-normal text-[#64748b]">
              Send a bitcoin subscription to a friend
            </span>
          </div>
        </Cell>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => openTelegramLink(TELEGRAM_BOT_URL)}
          className="text-primary text-[15px] font-semibold"
        >
          {isExisting ? "Open Telegram Community" : "Join Our Community"}
        </button>
        <p className="text-muted-foreground text-[13px]">@{TELEGRAM_BOT_USERNAME}</p>
      </div>
    </div>
  );
}

// Only mounted once the platform is known to be Telegram.
function TelegramHome() {
  const router = useRouter();
  const launch = usePlatform().launch;

  const authData = launch?.initData;

  const registerUser = useRegisterTelegramUser(authData, launch?.raw);

  // Cached from a previous launch's 409 response (see
  // useRegisterTelegramUser) — lets a known returning user skip straight to
  // the dashboard without waiting on the network at all.
  const [cachedReturningUser] = useState(() => getIsExistingUserFromStorage());
  // Whether a session existed when the app opened. The live token can't be
  // used for the copy: the launch sign-in issues one to brand-new users too,
  // which would flip "Join…" to "Welcome Back!" a moment after opening.
  const [hadTokenAtLaunch] = useState(() => !!getAuthTokenFromStorage());

  // /api/user (Mongo-backed) already fires on every launch — read its
  // result instead of ignoring it. status 409 means this Telegram id was
  // already registered, i.e. a returning user, who skips straight to the
  // dashboard. It only fires when the profile has a username; without one,
  // treat the visitor as new rather than waiting on a call that never runs.
  const canCheckExisting = !!(authData?.user?.id && authData?.user?.username);
  const isReturningUser = cachedReturningUser || registerUser.data?.status === 409;
  const checkPending =
    !cachedReturningUser &&
    canCheckExisting &&
    registerUser.data === undefined &&
    !registerUser.isError;

  // Returning users go straight to the wallet without waiting for the token:
  // inside Telegram, /dashboard's useAuthGuard waits in place while
  // useRegisterUser signs in from initData (and shows a "reopen the app"
  // notice if that fails), so there's no redirect loop back to /.
  const shouldRedirect = isReturningUser;
  const isExisting = hadTokenAtLaunch || cachedReturningUser;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/dashboard?tab=wallet");
    }
  }, [shouldRedirect, router]);

  if (checkPending || shouldRedirect) {
    return <PageShell />;
  }

  return (
    <PageShell>
      <UserScreen isExisting={isExisting || isReturningUser} />
    </PageShell>
  );
}

export default function Home() {
  const router = useRouter();
  const { kind } = usePlatform();
  const { status } = useSession();
  const isBrowserAuthed = status === "authenticated";

  useEffect(() => {
    if (kind === "web" && isBrowserAuthed) {
      router.replace("/dashboard?tab=wallet");
    }
  }, [kind, isBrowserAuthed, router]);

  // Platform detection still running — avoid flashing either UI.
  if (kind === null) {
    return <PageShell />;
  }

  if (kind === "web") {
    // Already authenticated — redirecting into /dashboard above; render
    // nothing in the meantime instead of flashing the login screen.
    return isBrowserAuthed ? <PageShell /> : <BrowserLoginScreen />;
  }

  return <TelegramHome />;
}
