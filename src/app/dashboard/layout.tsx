"use client";

import BottomNavigation from "@/components/bottomNavigation";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { SheetsProvider } from "@/components/dashboard/sheets";
import { useEffect, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useSession } from "@/hooks/useSession";
import WalletLoading from "./loading";
import ActivityLoading from "./activity/loading";
import NewsLoading from "./news/loading";
import PlansLoading from "./plans/loading";
import ChoosePlanLoading from "./plans/choose/loading";
import ProfileLoading from "./profile/loading";
import SellLoading from "./sell/loading";
import { kycStatusOptions } from "@/hooks/query/useKyc";
import { bankAccountsOptions } from "@/hooks/query/useBankAccounts";
import { subscriptionCurrentOptions } from "@/hooks/query/useSubscriptionCurrent";
import { preloadEmoji } from "@/components/ui/emoji";
import { PLAN_ICONS } from "@/components/dashboard/wallet/PlanSummaryCard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sessionExpired, signingIn } = useAuthGuard();
  const { status } = useSession();
  const pathname = usePathname();

  // Warm the shared query cache as soon as any dashboard page mounts, not
  // just when the plans tab does — by the time the user taps into Plans,
  // these are already fetched (or in flight), so it skips straight past
  // the kycLoading/noActivePlan skeleton states instead of flashing them.
  const queryClient = useQueryClient();
  useEffect(() => {
    if (status !== "authenticated") return;
    queryClient.prefetchQuery(kycStatusOptions());
    queryClient.prefetchQuery(subscriptionCurrentOptions());
    // The wallet's setup card waits on it: start it with the first batch,
    // not after the screen mounts (one round trip less on cold load).
    queryClient.prefetchQuery(bankAccountsOptions());
  }, [status, queryClient]);

  // Plan creatures (Plans tab cards at 40px, the confirm sheet at 84px; the 40px set also covers
  // the 36px hero/summary icons). Fetched once the first screen is idle, so opening Plans
  // doesn't pop them in after the cards render.
  useEffect(() => {
    const warm = () => {
      for (const src of Object.values(PLAN_ICONS)) {
        preloadEmoji(src, 40);
        preloadEmoji(src, 84);
      }
    };
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(warm, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 500);
    return () => clearTimeout(id);
  }, []);

  // Pull down from the top of any tab: refetch what's on screen, and re-render
  // the server parts (news is fetched on the server).
  const router = useRouter();
  const refresh = () => {
    router.refresh();
    return queryClient.refetchQueries({ type: "active" });
  };

  // A news article opens at the top. Next only scrolls when the new page isn't
  // already in view, and with the sticky header it usually is, so an article
  // opened from a scrolled list kept that offset.
  useLayoutEffect(() => {
    if (/^\/dashboard\/news\/[^/]+/.test(pathname)) window.scrollTo(0, 0);
  }, [pathname]);

  // Pushed pages (buy, sell, send, profile) hide the tab bar; news articles keep it.
  const showNav = !PUSHED_PAGES.some((p) => pathname.startsWith(p));

  return (
    // Phone-width column, centered on a plain page on wider screens.
    <SheetsProvider>
      <div className="bg-background min-h-app relative mx-auto flex w-full max-w-[440px] flex-col overflow-x-clip px-4 transition-colors duration-300">
        <AppHeader />
        <main
          className={
            showNav
              ? "flex flex-1 flex-col gap-5 pt-3 pb-[calc(var(--nav-bottom)+100px)]"
              : "flex flex-1 flex-col gap-5 pt-3 pb-[calc(40px+env(safe-area-inset-bottom))]"
          }
        >
          {sessionExpired ? (
            <SessionExpiredNotice />
          ) : (status === "loading" || signingIn) &&
            !RENDER_WITHOUT_SESSION.some((p) => pathname.startsWith(p)) ? (
            // Server render / hydration (the localStorage token isn't known yet),
            // or Telegram signing in again: show this tab's skeleton instead of
            // the page with no data, which would flash "No Active Plan" and zeros.
            <TabSkeleton pathname={pathname} />
          ) : (
            <PullToRefresh onRefresh={refresh} className="flex flex-1 flex-col gap-5">
              {children}
            </PullToRefresh>
          )}
        </main>
        {showNav && <BottomNavigation />}
      </div>
    </SheetsProvider>
  );
}

const PUSHED_PAGES = [
  "/dashboard/buy",
  "/dashboard/sell/",
  "/dashboard/send",
  "/dashboard/profile",
];

// Telegram only: the initData this Mini App was opened with is too old for the
// backend to accept, so a fresh launch is the only way to sign in again.
function SessionExpiredNotice() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-[18px] font-bold">Session expired</p>
      <p className="text-ink2 text-[14px]">
        Close Bitcoin Deepa and open it again from the bot to continue.
      </p>
    </div>
  );
}

// Pages that don't depend on the session render for real from the server
// instead of a skeleton: news (server-fetched) and tasks (static list).
const RENDER_WITHOUT_SESSION = ["/dashboard/news"];

function TabSkeleton({ pathname }: { pathname: string }) {
  if (pathname.startsWith("/dashboard/activity")) return <ActivityLoading />;
  if (pathname.startsWith("/dashboard/news")) return <NewsLoading />;
  if (pathname.startsWith("/dashboard/plans/choose")) return <ChoosePlanLoading />;
  if (pathname.startsWith("/dashboard/plans")) return <PlansLoading />;
  if (pathname.startsWith("/dashboard/profile")) return <ProfileLoading />;
  if (pathname.startsWith("/dashboard/sell")) return <SellLoading />;
  return <WalletLoading />;
}
