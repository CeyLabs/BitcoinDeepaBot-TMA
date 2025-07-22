"use client";

import type React from "react";
import BottomNavigation from "@/components/bottomNavigation";
import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { getAuthTokenFromStorage, getIsExistingUserFromStorage } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isExistingUser, setIsExistingUser } = useStore();

    useEffect(() => {
        const token = getAuthTokenFromStorage();
        const isExisting = getIsExistingUserFromStorage();

        if (token) {
            setIsExistingUser(isExisting);
        } else {
            router.push("/onboard");
        }
    }, [router, setIsExistingUser]);

    return (
        <div className="mx-auto min-h-screen max-w-md p-5">
            {children}
            {/* Only show bottom navigation for registered users */}
            {isExistingUser && <BottomNavigation />}
        </div>
    );
}
