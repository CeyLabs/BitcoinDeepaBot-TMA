"use client";

import BottomNavigationV2 from "@/components/v2/bottomNavigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardV2Layout({ children }: { children: React.ReactNode }) {
  const { isExistingUser } = useAuthGuard();

  return (
    <div className="mx-auto min-h-screen max-w-md px-5 pb-20 pt-5">
      {children}
      {isExistingUser && <BottomNavigationV2 />}
    </div>
  );
}
