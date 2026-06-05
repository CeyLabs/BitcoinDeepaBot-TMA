"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";
import fetchy from "@/lib/fetchy";
import { useStore } from "@/lib/store";
import { getAuthTokenFromStorage, getIsExistingUserFromStorage } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ClickableCard } from "@/components/ui/clickable-card";

// ─── Shared progress bar ────────────────────────────────────────────────────

function UserProgress() {
  const { count, setCount } = useStore();

  useEffect(() => {
    async function fetchUserCount() {
      const data = await fetchy.get<any>("/api/user");
      setCount((data.count as number) || 80);
    }
    fetchUserCount();
  }, [setCount]);

  const tierMaxCounts = [100, 200, 500, 1000, 2500, 5000, 10000];

  const getCurrentTierMax = (n: number): number => {
    for (const max of tierMaxCounts) {
      if (n <= max) return max;
    }
    return 10000;
  };

  const currentTierMax = getCurrentTierMax(count);
  const progressPct = Math.min((count / currentTierMax) * 100, 100);

  return (
    <div className="w-full space-y-2">
      <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#e2e8f0]">
        <div
          className="h-full rounded-full bg-[#fa7119] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="flex w-full items-baseline justify-between">
        <p className="text-[22px] font-bold tabular-nums text-[#1b2027]">
          {count.toLocaleString()}
          <span className="pl-1 text-sm font-normal text-[#64748b]">Joined</span>
        </p>
        <p className="text-sm font-medium tabular-nums text-[#94a3b8]">/{currentTierMax.toLocaleString()}</p>
      </div>
    </div>
  );
}

// ─── Shared page shell ───────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-white px-5 pb-10">
      {/* Logo + heading slot */}
      <section className="flex flex-col items-center justify-center pt-10 pb-8 text-center">
        <div className="relative mb-5 h-[150px] w-[220px]">
          <Image
            src="/BDLogo_Black.svg"
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

// ─── New user screen ─────────────────────────────────────────────────────────

function NewUserScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex w-full flex-col">
      <h1 className="max-w-[270px] self-center text-[22px] font-bold leading-snug text-[#1b2027]">
        Join Sri Lanka&apos;s Fastest Growing Bitcoin Community
      </h1>

      <div className="mt-6 mb-8">
        <UserProgress />
      </div>

      <div className="space-y-3">
        <Button variant="primary" onClick={onStart}>
          Start Using Wallet
        </Button>

        <ClickableCard
          icon={<Image src="/btc-coin-3d.png" alt="Bitcoin" width={40} height={40} className="object-contain" />}
          title="Subscribe to a Plan"
          subtitle="Choose Monthly or yearly subscriptions"
          onClick={onStart}
        />

        <ClickableCard
          icon={<span className="text-3xl">🎁</span>}
          title="Gift a Bitcoin Plan"
          subtitle="Send a bitcoin subscription to a friend"
          onClick={() => window.open("https://t.me/BitcoinDeepaBot", "_blank")}
        />
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <Link
          href="https://t.me/BitcoinDeepaBot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-semibold text-[#fa7119]"
        >
          Join Our Community
        </Link>
        <p className="text-[13px] text-[#94a3b8]">@BitcoinDeepaBot</p>
      </div>

      <div className="mt-6 flex justify-center">
        <Link href="/dev" className="text-xs text-[#cbd5e1] underline">
          Component Preview (Dev)
        </Link>
      </div>
    </div>
  );
}

// ─── Existing user screen ─────────────────────────────────────────────────────

function ExistingUserScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex w-full flex-col">
      <h1 className="max-w-[270px] self-center text-[22px] font-bold leading-snug text-[#1b2027]">
        Welcome Back!<br />You&apos;re Already a Member
      </h1>

      <div className="mt-6 mb-8">
        <UserProgress />
      </div>

      <div className="space-y-3">
        <Button variant="primary" onClick={onOpen}>
          Open My Wallet
        </Button>

        <ClickableCard
          icon={<Image src="/btc-coin-3d.png" alt="Bitcoin" width={40} height={40} className="object-contain" />}
          title="Manage My Plans"
          subtitle="View, extend or change plans"
          onClick={onOpen}
        />

        <ClickableCard
          icon={<Image src="/gift-emoji-3d.png" alt="Bitcoin" width={30} height={30} className="object-contain" />}
          title="Gift a Bitcoin Plan"
          subtitle="Send a bitcoin subscription to a friend"
          onClick={() => window.open("https://t.me/BitcoinDeepaBot", "_blank")}
        />
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <Link
          href="https://t.me/BitcoinDeepaBot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-semibold text-[#fa7119]"
        >
          Open Telegram Community
        </Link>
        <p className="text-[13px] text-[#94a3b8]">@BitcoinDeepaBot</p>
      </div>
    </div>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function Home() {
  const initLaunchParams = useLaunchParams().initData;
  const launchParams = useLaunchParams();
  const initData = useInitData();
  const { setUserID, isExistingUser } = useStore();
  const router = useRouter();
  const [isExisting, setIsExisting] = useState(false);

  const authData = useMemo(() => {
    return initLaunchParams || initData;
  }, [initLaunchParams, initData]);

  useEffect(() => {
    const { username, id } = authData?.user || {};

    async function addUserToDb() {
      if (id && username) {
        try {
          await fetchy.post("/api/user", {
            id: id,
            username: username,
            data: { authdata: authData, launchparam: launchParams },
          });
        } catch (error) {
          console.error("Error adding user to database:", error);
        }
      }
    }

    addUserToDb();
    setUserID(id?.toString() || "");
  }, [authData, launchParams, setUserID]);

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
      {isExisting ? (
        <ExistingUserScreen onOpen={goToDashboard} />
      ) : (
        <NewUserScreen onStart={goToDashboard} />
      )}
    </PageShell>
  );
}
