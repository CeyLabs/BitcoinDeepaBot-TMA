"use client";

import { useState } from "react";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";
import type { BankAccountFormData } from "@/lib/validations";

export interface Bank {
  code: number;
  name: string;
}

export type BankAccountStatus = "PENDING_REVIEW" | "VERIFIED" | "REJECTED";

/** GET /bank-accounts item. The account number is masked (last 4 digits). */
export interface BankAccount {
  id: string;
  bankCode: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: BankAccountStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

interface StatementUpload {
  key: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  maxBytes: number;
}

export const banksOptions = () =>
  queryOptions({
    queryKey: queryKeys.banks,
    queryFn: () => fetchy.get<Bank[]>("/bank-accounts/banks"),
    staleTime: 60 * 60_000,
  });

export const bankAccountsOptions = () =>
  queryOptions({
    queryKey: queryKeys.bankAccounts,
    queryFn: () => fetchy.get<BankAccount[]>("/bank-accounts"),
    // Verified by an admin outside the app: refetch whenever the user is back.
    staleTime: 0,
  });

export function useBanks(enabled = true) {
  const isAuthed = useSession().status === "authenticated";
  return useQuery({ ...banksOptions(), enabled: isAuthed && enabled });
}

export function useBankAccounts() {
  const isAuthed = useSession().status === "authenticated";
  const query = useQuery({ ...bankAccountsOptions(), enabled: isAuthed });
  // One account in review or verified at a time; a rejected one is history.
  const current = query.data?.find((a) => a.status !== "REJECTED") ?? query.data?.[0] ?? null;
  return { ...query, current, verified: current?.status === "VERIFIED" ? current : null };
}

export type AddBankAccountStep = "idle" | "uploading" | "submitting";

/**
 * Upload the statement to a temporary presigned URL, then submit the account
 * for review. `step` drives the button label.
 */
export function useAddBankAccount() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<AddBankAccountStep>("idle");

  const mutation = useMutation({
    mutationFn: async (data: BankAccountFormData) => {
      try {
        setStep("uploading");
        const upload = await fetchy.post<StatementUpload>("/bank-accounts/statement-upload", {
          contentType: data.statement.type,
          size: data.statement.size,
        });
        try {
          await fetchy.putRaw(upload.uploadUrl, data.statement, upload.headers);
        } catch {
          throw new Error("Couldn't upload the statement, please try again");
        }

        setStep("submitting");
        return await fetchy.post<BankAccount>("/bank-accounts", {
          bankCode: data.bankCode,
          accountNumber: data.accountNumber,
          accountName: data.accountName,
          statementKey: upload.key,
        });
      } finally {
        setStep("idle");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts }),
  });

  return { ...mutation, step };
}

export function useRemoveBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchy.delete<void>(`/bank-accounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts }),
  });
}
