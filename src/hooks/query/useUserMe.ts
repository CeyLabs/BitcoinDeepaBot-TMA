"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";

/** GET /user/me — the backend's user row (only the fields we show). */
export interface UserMe {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  is_profile_complete: boolean;
  /** Seed of the DiceBear avatar; null until the user picks one */
  avatar_seed?: string | null;
}

export const userMeOptions = () =>
  queryOptions({
    queryKey: queryKeys.userMe,
    queryFn: () => fetchy.get<UserMe>("/user/me"),
  });

export function useUserMe() {
  const isAuthed = useSession().status === "authenticated";
  return useQuery({ ...userMeOptions(), enabled: isAuthed });
}

/** Save a new avatar seed (the app draws the picture; the backend keeps only the seed). */
export function useSetAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seed: string) => fetchy.patch<UserMe>("/user/avatar", { seed }),
    onSuccess: (me) => queryClient.setQueryData(queryKeys.userMe, me),
  });
}

/**
 * The user's avatar seed: the one they picked, else their Telegram id (so
 * everyone has a stable sprout before choosing). Null while loading.
 */
export function useAvatarSeed(): string | null {
  const session = useSession();
  const { data } = useUserMe();
  if (session.status !== "authenticated") return null;
  return data?.avatar_seed || session.user?.id || null;
}
