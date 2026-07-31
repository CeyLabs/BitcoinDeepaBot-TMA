"use client";

import BottomNavigation from "@/components/bottomNavigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard();

  return (
    <div className="bg-surface-main mx-auto flex min-h-screen max-w-md flex-col gap-5 px-5 pt-5 pb-22">
      {children}
      <BottomNavigation />
    </div>
  );
}
