"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getAuthTokenFromStorage } from "@/lib/auth";
import fetchy from "@/lib/fetchy";
import type { User } from "@/lib/types";

export interface KycStatusResponse {
  status: NonNullable<User["kycStatus"]>;
  url?: string;
}

export function useKycStatus() {
  const authToken = getAuthTokenFromStorage();

  return useQuery<KycStatusResponse>({
    queryKey: ["kyc-status"],
    queryFn: () =>
      fetchy.get<KycStatusResponse>("/api/user/kyc/status", {
        headers: { Authorization: `Bearer ${authToken}` },
        shouldCache: false,
      }),
    enabled: !!authToken,
  });
}

interface KycInitiatePayload {
  user_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface KycInitiateResponse {
  url?: string;
  message?: string;
}

export function useKycInitiate() {
  const authToken = getAuthTokenFromStorage();

  return useMutation({
    mutationFn: (payload: KycInitiatePayload) =>
      fetchy.post<KycInitiateResponse, KycInitiatePayload>(
        "/api/user/kyc/initiate",
        payload,
        { headers: { Authorization: `Bearer ${authToken}` } }
      ),
  });
}
