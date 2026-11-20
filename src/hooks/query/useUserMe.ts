"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";
import { normalizeUsername, USERNAME_RE } from "@/lib/username";
import { useDebounced } from "@/hooks/useDebounced";

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
  /** The member's Bitcoin Deepa @username (not Telegram's); null until claimed, then permanent */
  username?: string | null;
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

export interface UsernameAvailability {
  username: string;
  available: boolean;
  reason: string | null;
}

/**
 * Whether a username can be claimed, for the hint while typing. Checks the
 * format locally first (no request for an invalid name), then asks the
 * backend once typing pauses.
 */
export function useUsernameAvailability(input: string) {
  const isAuthed = useSession().status === "authenticated";
  const username = useDebounced(normalizeUsername(input));
  const valid = USERNAME_RE.test(username);
  const query = useQuery({
    queryKey: queryKeys.usernameAvailability(username),
    queryFn: () =>
      fetchy.get<UsernameAvailability>(
        `/user/username/availability?username=${encodeURIComponent(username)}`
      ),
    enabled: isAuthed && valid,
    staleTime: 30_000,
  });
  // Still typing (the debounced value is behind) counts as checking
  const settled = username === normalizeUsername(input);
  return { username, valid, settled, ...query };
}

/** Claim the user's username: once, it can't be changed afterwards. */
export function useClaimUsername() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => fetchy.post<UserMe>("/user/username", { username }),
    onSuccess: (me) => queryClient.setQueryData(queryKeys.userMe, me),
  });
}
