"use client";

import BottomNavigation from "@/components/bottomNavigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 bg-surface-main px-5 pb-22 pt-5">
      {children}
      <BottomNavigation />
    </div>
  );
}
