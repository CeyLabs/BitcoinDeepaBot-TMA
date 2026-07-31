"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import fetchy from "@/lib/fetchy";
import type { SubscriptionPlan } from "@/lib/types";

interface RawPackage {
  id: string;
  name: string;
  frequency: "weekly" | "monthly";
  amount: number;
  currency: string;
  features?: string[];
  popular?: boolean;
}

type PackagesResponse = RawPackage[] | { packages: RawPackage[] };

function normalizePackage(pkg: RawPackage): SubscriptionPlan {
  return {
    id: pkg.id,
    name: pkg.name,
    type: pkg.frequency,
    amount: pkg.amount,
    currency: pkg.currency,
    features: pkg.features ?? [],
    popular: pkg.popular,
  };
}

export function usePackages() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: queryKeys.packages,
    queryFn: async () => {
      const data = await fetchy.get<PackagesResponse>("/api/packages", {
        shouldCache: false,
      });
      const raw = Array.isArray(data) ? data : (data.packages ?? []);
      return raw.map(normalizePackage);
    },
    staleTime: 1000 * 60 * 5,
  });
}
