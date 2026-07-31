"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { getAuthTokenFromStorage, getIsExistingUserFromStorage } from "@/lib/auth";

/**
 * Redirects to / when there's no auth token, otherwise syncs
 * isExistingUser from storage into the store.
 */
export function useAuthGuard() {
  const router = useRouter();
  const { isExistingUser, setIsExistingUser } = useStore();

  useEffect(() => {
    const token = getAuthTokenFromStorage();

    if (token) {
      setIsExistingUser(getIsExistingUserFromStorage());
    } else {
      router.push("/");
    }
  }, [router, setIsExistingUser]);

  return { isExistingUser };
}
