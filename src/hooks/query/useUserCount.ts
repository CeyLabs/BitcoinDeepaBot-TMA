"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import fetchy from "@/lib/fetchy";

export const userCountOptions = () =>
  queryOptions({
    queryKey: queryKeys.userCount,
    queryFn: () => fetchy.get<{ count: number }>("/api/user"),
  });

/** Community member count (Mongo-backed /api/user). */
export function useUserCount() {
  const { data, isPending } = useQuery(userCountOptions());
  // isPending only until the first count arrives; refetches keep showing the cached one.
  return { count: data ? (data.count ?? 80) : 0, isLoading: isPending };
}
