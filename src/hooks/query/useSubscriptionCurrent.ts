"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy, { FetchyError } from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";
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

export function useSubscriptionCurrent() {
  const isAuthed = useSession().status === "authenticated";

  return useQuery<Subscription | null>({
    queryKey: queryKeys.subscriptionCurrent,
    queryFn: async () => {
      let sub: RawSubscription;
      try {
        sub = await fetchy.get<RawSubscription>("/subscription/current");
      } catch (error) {
        // Backend 404s when the user has no subscription.
        if (error instanceof FetchyError && error.status === 404) return null;
        throw error;
      }

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
    enabled: isAuthed,
  });
}
