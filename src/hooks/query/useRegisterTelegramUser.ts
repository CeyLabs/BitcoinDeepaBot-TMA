"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import fetchy from "@/lib/fetchy";

type TelegramAuthData = { user?: { id?: number; username?: string } } | undefined;

type RegisterUserPayload = {
  id: number;
  username: string;
  data: { authdata: TelegramAuthData; launchparam: unknown };
};

export function useRegisterTelegramUser(authData: TelegramAuthData, launchParams: unknown) {
  const { mutate } = useMutation({
    mutationFn: (payload: RegisterUserPayload) => fetchy.post("/api/user", payload),
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
