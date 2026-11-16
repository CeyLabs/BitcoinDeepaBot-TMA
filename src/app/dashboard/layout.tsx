"use client";

import BottomNavigation from "@/components/bottomNavigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useSubscriptionCurrent } from "@/hooks/query/useSubscriptionCurrent";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sessionExpired } = useAuthGuard();

  // Warm the shared query cache as soon as any dashboard page mounts, not
  // just when the plans tab does — by the time the user taps into Plans,
  // these are already fetched (or in flight), so it skips straight past
  // the kycLoading/noActivePlan LoadingPage states instead of flashing them.
  useKycStatus();
  useSubscriptionCurrent();

  return (
    // Phone-width column. On wider screens (desktop web) it's framed as a
    // card so it doesn't look like a stray strip.
    <div className="bg-surface-main mx-auto flex min-h-screen max-w-md flex-col gap-5 px-5 pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:my-6 md:min-h-[calc(100vh-3rem)] md:rounded-[24px] md:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] md:ring-1 md:ring-black/5 dark:md:ring-white/5">
      {sessionExpired ? <SessionExpiredNotice /> : children}
      <BottomNavigation />
    </div>
  );
}

// Telegram only: the initData this Mini App was opened with is too old for the
// backend to accept, so a fresh launch is the only way to sign in again.
function SessionExpiredNotice() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-[18px] font-bold text-[#1b2027] dark:text-white">Session expired</p>
      <p className="text-[14px] text-[#475569] dark:text-[#94a3b8]">
        Close Bitcoin Deepa and open it again from the bot to continue.
      </p>
    </div>
  );
}
