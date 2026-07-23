"use client";

import BottomNavigationV2 from "@/components/v2/bottomNavigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardV2Layout({ children }: { children: React.ReactNode }) {
  useAuthGuard();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 bg-surface-main px-5 pb-22 pt-5">
      {children}
      <BottomNavigationV2 />
    </div>
  );
}
