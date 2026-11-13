"use client";

import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT, getAuthTokenFromStorage } from "@/lib/auth";

/** Current auth token from storage, updated when it is saved or cleared. */
export function useAuthToken() {
  const [token, setToken] = useState(() => getAuthTokenFromStorage());

  useEffect(() => {
    const sync = () => setToken(getAuthTokenFromStorage());
    sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return token;
}
