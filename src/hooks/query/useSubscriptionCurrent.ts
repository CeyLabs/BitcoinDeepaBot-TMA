"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthTokenFromStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";
import type { Subscription } from "@/lib/types";

interface SubscriptionCurrentResponse {
  subscription: Subscription | null;
  message?: string;
}

export function useSubscriptionCurrent() {
  const authToken = getAuthTokenFromStorage();

  return useQuery<Subscription | null>({
    queryKey: ["subscription-current"],
    queryFn: async () => {
      const data = await fetchy.get<SubscriptionCurrentResponse>("/api/subscription/current", {
        headers: { Authorization: `Bearer ${authToken}` },
        shouldCache: false,
      });
      return data.subscription ?? null;
    },
    enabled: !!authToken,
  });
}
