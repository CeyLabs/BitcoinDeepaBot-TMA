"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import fetchy from "@/lib/fetchy";
import type { SubscriptionPlan } from "@/lib/types";

type PackagesResponse = SubscriptionPlan[] | { packages: SubscriptionPlan[] };

export function usePackages() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: queryKeys.packages,
    queryFn: async () => {
      const data = await fetchy.get<PackagesResponse>("/api/packages", { shouldCache: false });
      return Array.isArray(data) ? data : (data.packages ?? []);
    },
    staleTime: 1000 * 60 * 5,
  });
}
