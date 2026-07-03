"use client";

import BottomNavigationV2 from "@/components/v2/bottomNavigation";
import { DashboardTopBar } from "@/components/v2/dashboard/DashboardTopBar";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardV2Layout({ children }: { children: React.ReactNode }) {
  const { isExistingUser } = useAuthGuard();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-5 pb-20 pt-5 bg-[#EEEFF3]">
      <DashboardTopBar />
      {children}
      {isExistingUser && <BottomNavigationV2 />}
    </div>
  );
}
