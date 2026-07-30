"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAuthTokenFromStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";
import type { DCSummary } from "@/lib/types";

export function useWalletSummary() {
  const authToken = getAuthTokenFromStorage();

  return useQuery<DCSummary>({
    queryKey: queryKeys.walletSummary,
    queryFn: () =>
      fetchy.get<DCSummary>("/api/transaction/dca-summary", {
        headers: { Authorization: `Bearer ${authToken}` },
        shouldCache: false,
      }),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
  });
}
