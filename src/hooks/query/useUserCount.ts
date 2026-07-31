"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useStore } from "@/lib/store";
import fetchy from "@/lib/fetchy";

export function useUserCount() {
  const { count, setCount } = useStore();

  const { data } = useQuery({
    queryKey: queryKeys.userCount,
    queryFn: () => fetchy.get<{ count: number }>("/api/user"),
  });

  useEffect(() => {
    if (data) {
      setCount(data.count ?? 80);
    }
  }, [data, setCount]);

  return { count };
}
