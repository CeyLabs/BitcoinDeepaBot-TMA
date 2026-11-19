"use client";

import { useEffect } from "react";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import fetchy, { FetchyError } from "@/lib/fetchy";
import { queryKeys } from "@/lib/query-keys";
import { p2pPollInterval, type P2pMe, type P2pRecipient, type P2pTransfer } from "@/lib/p2p";
import { useDebounced } from "@/hooks/useDebounced";
import { normalizeUsername, USERNAME_RE } from "@/lib/username";

export interface P2pSendInput {
  to_telegram_id: number;
  amount: number;
  memo?: string;
  /** One per payment, reused on every retry of it (the bot won't send twice) */
  idempotency_key: string;
}

/** Don't retry what retrying can't fix (4xx: relogin_required, not found, ...) */
const retryUnless4xx = (failures: number, error: unknown) =>
  !(error instanceof FetchyError && error.status < 500) && failures < 2;

export const p2pMeOptions = () =>
  queryOptions({
    queryKey: queryKeys.p2pMe,
    queryFn: () => fetchy.get<P2pMe>("/p2p/me"),
    staleTime: 15_000,
    retry: retryUnless4xx,
  });

export const p2pTransferOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.p2pTransfer(id),
    queryFn: () => fetchy.get<P2pTransfer>(`/p2p/transfers/${id}`),
    staleTime: 0,
    refetchInterval: (query) => p2pPollInterval(query.state.data?.status),
    retry: retryUnless4xx,
  });

export function useP2pMe(enabled = true) {
  const isAuthed = useSession().status === "authenticated";
  return useQuery({ ...p2pMeOptions(), enabled: isAuthed && enabled });
}

export function useP2pTransfer(id: string) {
  const isAuthed = useSession().status === "authenticated";
  const queryClient = useQueryClient();
  const query = useQuery({ ...p2pTransferOptions(id), enabled: isAuthed && !!id });

  // Once it's final the balance and the transfer history changed (once per status)
  const status = query.data?.status;
  useEffect(() => {
    if (status && p2pPollInterval(status) === false) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary });
      void queryClient.invalidateQueries({ queryKey: ["bot-transactions"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.p2pMe });
    }
  }, [status, queryClient]);

  return query;
}

/**
 * Finds a member by their Bitcoin Deepa @username (the backend's own DB). Looks up once typing pauses, and only names
 * that pass the format check; a 404 means no one has it.
 */
export function useRecipient(input: string) {
  const isAuthed = useSession().status === "authenticated";
  const username = useDebounced(normalizeUsername(input));
  const valid = USERNAME_RE.test(username);
  const query = useQuery({
    queryKey: queryKeys.p2pRecipient(username),
    queryFn: () => fetchy.post<P2pRecipient>("/p2p/resolve", { to: username }),
    enabled: isAuthed && valid,
    staleTime: 60_000,
    retry: false,
  });
  const settled = username === normalizeUsername(input);
  return { username, valid, settled, ...query };
}

export function useP2pSend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: P2pSendInput) => fetchy.post<P2pTransfer>("/p2p/send", input),
    onSuccess: (transfer) => {
      queryClient.setQueryData(queryKeys.p2pTransfer(transfer.id), transfer);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.walletSummary });
      void queryClient.invalidateQueries({ queryKey: ["bot-transactions"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.p2pMe });
    },
  });
}
