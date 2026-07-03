"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthTokenFromStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";
import type { User } from "@/lib/types";

interface KycStatusResponse {
  status: NonNullable<User["kycStatus"]>;
}

export function useKycStatus() {
  const authToken = getAuthTokenFromStorage();

  return useQuery<NonNullable<User["kycStatus"]>>({
    queryKey: ["kyc-status"],
    queryFn: async () => {
      const data = await fetchy.get<KycStatusResponse>("/api/user/kyc/status", {
        headers: { Authorization: `Bearer ${authToken}` },
        shouldCache: false,
      });
      return data.status;
    },
    enabled: !!authToken,
  });
}
