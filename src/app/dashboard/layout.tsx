"use client";

import BottomNavigation from "@/components/bottomNavigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useSubscriptionCurrent } from "@/hooks/query/useSubscriptionCurrent";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard();

  // Warm the shared query cache as soon as any dashboard page mounts, not
  // just when the plans tab does — by the time the user taps into Plans,
  // these are already fetched (or in flight), so it skips straight past
  // the kycLoading/noActivePlan LoadingPage states instead of flashing them.
  useKycStatus();
  useSubscriptionCurrent();

  return (
    <div className="bg-surface-main mx-auto flex min-h-screen max-w-md flex-col gap-5 px-5 pt-5 pb-22">
      {children}
      <BottomNavigation />
    </div>
  );
}
