"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

type TelegramAuthData = { user?: { id?: number; username?: string } } | undefined;

type RegisterUserPayload = {
  id: number;
  username: string;
  data: { authdata: TelegramAuthData; launchparam: unknown };
};

async function registerTelegramUser(payload: RegisterUserPayload) {
  const res = await fetch("/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to register user");
  return res.json();
}

export function useRegisterTelegramUser(authData: TelegramAuthData, launchParams: unknown) {
  const { mutate } = useMutation({
    mutationFn: registerTelegramUser,
    onError: (error) => {
      console.error("Error adding user to database:", error);
    },
  });

  useEffect(() => {
    const { username, id } = authData?.user || {};
    if (id && username) {
      mutate({ id, username, data: { authdata: authData, launchparam: launchParams } });
    }
  }, [authData, launchParams, mutate]);
}
