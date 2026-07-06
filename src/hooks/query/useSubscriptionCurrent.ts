"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthTokenFromStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";
import type { Subscription, SubscriptionPlan } from "@/lib/types";

// Shape actually returned by the external API — package name/price live in a
// separate /package resource, not inlined here, so they must be joined below.
interface RawSubscription {
  payhere_sub_id?: string;
  package_id?: string;
  frequency?: "weekly" | "monthly";
  created_at: string;
  next_billing_date?: string;
  updated_at: string;
  is_active: boolean;
  user_id?: string;
}

interface SubscriptionCurrentResponse {
  subscription: RawSubscription | null;
  message?: string;
}

type PackagesResponse = SubscriptionPlan[] | { packages: SubscriptionPlan[] };

function calculateEndDate(startDate: string, planType: string): string {
  const start = new Date(startDate);
  const daysToAdd = planType === "weekly" ? 7 : 30;
  return new Date(start.getTime() + daysToAdd * 86400000).toISOString();
}

export function useSubscriptionCurrent() {
  const authToken = getAuthTokenFromStorage();

  return useQuery<Subscription | null>({
    queryKey: ["subscription-current"],
    queryFn: async () => {
      const [data, packagesData] = await Promise.all([
        fetchy.get<SubscriptionCurrentResponse>("/api/subscription/current", {
          headers: { Authorization: `Bearer ${authToken}` },
          shouldCache: false,
        }),
        fetchy.get<PackagesResponse>("/api/packages", { shouldCache: false }),
      ]);

      const sub = data.subscription;
      if (!sub) return null;

      const packages = Array.isArray(packagesData) ? packagesData : (packagesData.packages ?? []);
      const pkg = packages.find((p) => p.id === sub.package_id);

      return {
        id: sub.payhere_sub_id ?? "",
        planName: pkg?.name ?? "Unknown Plan",
        planType: sub.frequency ?? "monthly",
        price: pkg?.amount ?? 0,
        currency: "Rs",
        startDate: sub.created_at,
        endDate:
          sub.next_billing_date ??
          (pkg ? calculateEndDate(sub.created_at, pkg.type) : sub.updated_at),
        isActive: sub.is_active,
        packageId: sub.package_id,
        userId: sub.user_id,
        payhereSubId: sub.payhere_sub_id,
      };
    },
    enabled: !!authToken,
  });
}
