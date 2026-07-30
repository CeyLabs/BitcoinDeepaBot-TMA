"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthTokenFromStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";

export function useCancelSubscription() {
  const authToken = getAuthTokenFromStorage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      fetchy.post<{ message?: string }, Record<string, never>>(
        "/api/subscription/cancel",
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionCurrent });
    },
  });
}
