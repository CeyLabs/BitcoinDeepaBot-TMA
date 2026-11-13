"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { getIsExistingUserFromStorage } from "@/lib/auth";
import { useSession } from "@/hooks/useSession";

/**
 * Redirects to / whenever there's no valid session — on mount, and also later
 * if the token expires or the backend rejects it (401). Otherwise syncs
 * isExistingUser from storage into the store.
 */
export function useAuthGuard() {
  const router = useRouter();
  const { status } = useSession();
  const { isExistingUser, setIsExistingUser } = useStore();

  useEffect(() => {
    if (status === "authenticated") {
      setIsExistingUser(getIsExistingUserFromStorage());
    } else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router, setIsExistingUser]);

  return { isExistingUser };
}
