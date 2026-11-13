"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useStore } from "@/lib/store";
import fetchy from "@/lib/fetchy";

export function useUserCount() {
  const { count, setCount } = useStore();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.userCount,
    queryFn: () => fetchy.get<{ count: number }>("/api/user"),
  });

  useEffect(() => {
    if (data) {
      setCount(data.count ?? 80);
    }
  }, [data, setCount]);

  // Loading only until we have a count to show — a count already in the
  // store from earlier in the session is fine to display while refetching.
  return { count, isLoading: isLoading && count === 0 };
}
