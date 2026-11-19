/** Sending sats from the user's own bot wallet to another bot user (backend /p2p/*). */

export type P2pTransferStatus =
  | "processing"
  | "awaiting_confirmation"
  | "in_flight"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

/**
 * A member found by their Bitcoin Deepa @username (our DB). `name` is
 * masked ("Nimal S."); the send goes to `telegram_id`.
 */
export interface P2pRecipient {
  telegram_id: number;
  username?: string;
  name?: string | null;
  avatar_seed?: string | null;
}

export interface P2pMe {
  telegram_id: number;
  username?: string;
  name?: string;
  balance: number;
  balance_lkr?: string;
  limits: {
    max_amount: number;
    daily_limit: number;
    daily_used: number;
    daily_remaining: number;
    /** Above what's left of this today, the user confirms in the bot chat */
    confirm_threshold: number;
    unconfirmed_remaining: number;
  };
}

/** Optional fields are left out by the bot when empty. */
export interface P2pTransfer {
  id: string;
  kind: "internal";
  status: P2pTransferStatus;
  amount: number;
  amount_lkr?: string;
  memo?: string;
  to?: P2pRecipient;
  /** Why it failed / was cancelled / expired (user-facing) */
  error?: string;
  /** Until when it can be confirmed in the bot chat */
  confirm_by?: string;
  created_at: string;
}

export const FINAL_P2P_STATUSES: P2pTransferStatus[] = [
  "completed",
  "failed",
  "cancelled",
  "expired",
];

/**
 * How often to re-check a transfer (the bot's advice), or false once final:
 * every 2.5s while it runs or waits for Confirm in the bot chat, every 20s
 * while a payment is in flight.
 */
export function p2pPollInterval(status: P2pTransferStatus | undefined): number | false {
  if (!status || FINAL_P2P_STATUSES.includes(status)) return false;
  return status === "in_flight" ? 20_000 : 2_500;
}

/**
 * 403 relogin_required: the bot hasn't linked this user to our session (or
 * it's a pre-update login). A new login links them (reopen the Mini App /
 * log in again on the web). The session itself is still valid.
 */
export const isReloginError = (code: string | undefined) => code === "relogin_required";

/** @name, name or a numeric Telegram ID, as typed */
export const normalizeRecipient = (input: string) => input.trim();

/** "Bob Silva (@bob)", "@bob", "Bob Silva" or the id */
export function recipientLabel(r: P2pRecipient | undefined): string {
  if (!r) return "";
  if (r.name && r.username && r.name !== `@${r.username}`) return `${r.name} (@${r.username})`;
  return r.name || (r.username ? `@${r.username}` : String(r.telegram_id));
}
