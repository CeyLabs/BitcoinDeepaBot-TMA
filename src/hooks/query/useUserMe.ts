"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
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
