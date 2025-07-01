"use client";

import type React from "react";
import BottomNavigation from "@/components/bottomNavigation";
import { useStore } from "@/lib/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isExistingUser } = useStore();
  
  return (
    <div className="mx-auto min-h-screen max-w-md p-5">
      {children}
      {/* Only show bottom navigation for registered users */}
      {isExistingUser && <BottomNavigation />}
    </div>
  );
}