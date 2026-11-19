"use client";

import { useEffect, useState } from "react";
import { SlowLoadNotice } from "@/components/SlowLoadNotice";
import { Logo } from "@/components/ui/logo";
import { cn } from "cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Cell, CellChevron } from "@/components/ui/cell";
import { Emoji } from "@/components/ui/emoji";
import { LandingShell } from "@/components/auth/LandingShell";
import { getAuthTokenFromStorage, getIsExistingUserFromStorage } from "@/lib/auth";
import { TELEGRAM_BOT_URL, TELEGRAM_BOT_USERNAME } from "@/lib/constants";
import { useRegisterTelegramUserResult } from "@/hooks/query/useRegisterTelegramUser";
import { usePlatform } from "@/platform";
import { useSession } from "@/hooks/useSession";
import BrowserLoginScreen from "@/components/auth/BrowserLoginScreen";
import { UserProgress } from "@/components/auth/UserProgress";

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
    <LandingShell themeToggle={!loading} aria-label="Welcome to Bitcoin Deepa">
      <section
        aria-busy={loading || undefined}
        className={cn(
          "flex flex-col items-center text-center",
          loading && "animate-appear motion-reduce:animate-none"
        )}
      >
        <div
          className={cn(
            "relative h-[200px] w-full max-w-[300px]",
            loading
              ? "animate-breathe motion-reduce:animate-none"
              : "animate-logo-in motion-reduce:animate-none"
          )}
        >
          <Logo priority />
        </div>
        {loading ? (
          <div className="mt-6">
            <SlowLoadNotice />
          </div>
        ) : (
          children
        )}
      </section>
    </LandingShell>
  );
}

// ─── User screen (new + existing share everything but copy/icons) ─────────────

function UserScreen({ isExisting }: { isExisting: boolean }) {
  const { openTelegramLink } = usePlatform();
  return (
    <div className="flex w-full flex-col">
      <div className="stagger mt-6 flex w-full flex-col items-center gap-2">
        <h1 className="max-w-[330px] text-[26px] leading-8">
          {isExisting ? (
            <>
              Welcome back!
              <br />
              You&apos;re already a member
            </>
          ) : (
            "Join Sri Lanka’s Fastest Growing Bitcoin Community"
          )}
        </h1>
        <div className="mt-4 w-full">
          <UserProgress />
        </div>
      </div>

      <div className="stagger mt-8 flex flex-col gap-3">
        <Link href="/dashboard?tab=wallet" className={buttonVariants()}>
          {isExisting ? "Open my wallet" : "Join the community"}
        </Link>

        <Link href={isExisting ? "/dashboard/plans" : "/dashboard?tab=wallet"} className="block">
          <Cell
            before={<Emoji src={isExisting ? "/emoji/bitcoin.webp" : "/emoji/wallet.webp"} />}
            after={<CellChevron />}
            subtitle={isExisting ? "View, extend or change your plan" : "Open your wallet"}
            className="press"
          >
            {isExisting ? "Manage my plans" : "Already a member?"}
          </Cell>
        </Link>

        <button
          type="button"
          onClick={() => openTelegramLink(TELEGRAM_BOT_URL)}
          className="press text-ink3 mt-1 self-center rounded-lg border-0 bg-transparent px-2 py-1 text-[13px] font-semibold"
        >
          @{TELEGRAM_BOT_USERNAME}
        </button>
      </div>
    </div>
  );
}

// Only mounted once the platform is known to be Telegram.
function TelegramHome() {
  const router = useRouter();
  const launch = usePlatform().launch;

  const authData = launch?.initData;

  // Fired app-wide on launch (providers.tsx); read its result here.
  const registerUser = useRegisterTelegramUserResult();

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
