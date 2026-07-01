"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useStore } from "@/lib/store";

async function fetchUserCount(): Promise<{ count: number }> {
  const res = await fetch("/api/user");
  if (!res.ok) throw new Error("Failed to fetch user count");
  return res.json();
}

export function useUserCount() {
  const { count, setCount } = useStore();

  const { data } = useQuery({
    queryKey: queryKeys.userCount,
    queryFn: fetchUserCount,
  });

  useEffect(() => {
    if (data) {
      setCount(data.count || 80);
    }
  }, [data, setCount]);

  return { count };
}
