"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import fetchy from "@/lib/fetchy";
import type { DCSummary } from "@/lib/types";

export const walletSummaryOptions = () =>
  queryOptions({
    queryKey: queryKeys.walletSummary,
    queryFn: () => fetchy.get<DCSummary>("/transaction/dca-summary"),
    staleTime: 1000 * 60 * 5,
  });

export function useWalletSummary() {
  const isAuthed = useSession().status === "authenticated";
  return useQuery({ ...walletSummaryOptions(), enabled: isAuthed });
}
