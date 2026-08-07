"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import fetchy from "@/lib/fetchy";
import { markIsExistingUserInStorage, clearIsExistingUserInStorage } from "@/lib/auth";

type TelegramAuthData = { user?: { id?: number; username?: string } } | undefined;

type RegisterUserPayload = {
  id: number;
  username: string;
  data: { authdata: TelegramAuthData; launchparam: unknown };
};

export interface RegisterUserResponse {
  status: number; // 201 = newly created, 409 = already existed, 500 = error
  message: string;
  user?: unknown;
}

export function useRegisterTelegramUser(authData: TelegramAuthData, launchParams: unknown) {
  const mutation = useMutation({
    mutationFn: (payload: RegisterUserPayload) =>
      fetchy.post<RegisterUserResponse>("/api/user", payload),
    onSuccess: (data) => {
      // Keep the cached flag in sync with the authoritative server response
      // (this call fires on every launch regardless of cache) — 409 means
      // still registered, 201 means the id wasn't found, so any stale
      // "existing user" cache from a deleted account gets corrected here.
      if (data.status === 409) {
        markIsExistingUserInStorage();
      } else if (data.status === 201) {
        clearIsExistingUserInStorage();
      }
    },
    onError: (error) => {
      console.error("Error adding user to database:", error);
    },
  });

  const { mutate } = mutation;

  useEffect(() => {
    const { username, id } = authData?.user || {};
    if (id && username) {
      mutate({ id, username, data: { authdata: authData, launchparam: launchParams } });
    }
  }, [authData, launchParams, mutate]);

  return mutation;
}
