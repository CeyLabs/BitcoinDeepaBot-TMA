"use client";

import { useEffect } from "react";
import { useMutation, useMutationState } from "@tanstack/react-query";
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

/** Mutation key of the launch registration; read its result with useRegisterTelegramUserResult. */
export const REGISTER_TELEGRAM_USER_KEY = ["register-telegram-user"] as const;

/**
 * Registers the Telegram user in Mongo (/api/user) once per launch, on any
 * route. Mounted app-wide (providers.tsx) so returning users who go straight
 * to /dashboard are still registered.
 */
export function useRegisterTelegramUser(authData: TelegramAuthData, launchParams: unknown) {
  const mutation = useMutation({
    mutationKey: REGISTER_TELEGRAM_USER_KEY,
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

/** Latest launch-registration result (status 201 new / 409 existing), shared app-wide. */
export function useRegisterTelegramUserResult() {
  const latest = useMutationState({
    filters: { mutationKey: REGISTER_TELEGRAM_USER_KEY },
    select: (mutation) => ({
      data: mutation.state.data as RegisterUserResponse | undefined,
      isError: mutation.state.status === "error",
    }),
  }).at(-1);
  return { data: latest?.data, isError: latest?.isError ?? false };
}
