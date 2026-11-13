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
    queryFn: () => fetchy.get<DCSummary>("/transaction/dca-summary"),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 5,
  });
}
