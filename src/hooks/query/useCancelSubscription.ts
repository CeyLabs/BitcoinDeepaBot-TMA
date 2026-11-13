"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchy from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      fetchy.post<{ message?: string }, Record<string, never>>("/subscription/cancel", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionCurrent });
    },
  });
}
