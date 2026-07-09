"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthTokenFromStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";
import type { Subscription } from "@/lib/types";

// Shape actually returned by the external API — package name/price are
// inlined directly on the subscription, no separate /package lookup needed.
interface RawSubscription {
  payhere_sub_id?: string;
  package_id?: string;
  package_name: string;
  frequency: "weekly" | "monthly";
  dca_price: number;
  subscription_start_date: string;
  next_billing_date?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  user_id?: string;
}

interface SubscriptionCurrentResponse {
  subscription: RawSubscription | null;
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

      const sub = data.subscription;
      if (!sub) return null;

      return {
        id: sub.payhere_sub_id ?? "",
        planName: sub.package_name,
        planType: sub.frequency,
        price: sub.dca_price,
        currency: "Rs",
        startDate: sub.subscription_start_date,
        endDate: sub.next_billing_date ?? "",
        isActive: sub.is_active,
        packageId: sub.package_id,
        userId: sub.user_id,
        payhereSubId: sub.payhere_sub_id,
      };
    },
    enabled: !!authToken,
  });
}
