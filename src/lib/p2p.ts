/** Sending sats from the user's own bot wallet to another bot user (backend /p2p/*). */

export type P2pTransferStatus =
  | "processing"
  | "awaiting_confirmation"
  | "in_flight"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export interface P2pRecipient {
  telegram_id: number;
  username?: string;
  name?: string;
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
  credential: {
    platform: "mini_app" | "web";
    /** After this, a send needs a fresh Telegram session/login */
    spend_fresh_until: string;
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

/** The Mini App's initData auth_date (seconds), or null. */
export function initDataAuthDate(initDataRaw: string | undefined): number | null {
  if (!initDataRaw) return null;
  const authDate = Number(new URLSearchParams(initDataRaw).get("auth_date"));
  return Number.isFinite(authDate) && authDate > 0 ? authDate : null;
}

/**
 * Whether the Mini App's launch session is still fresh enough to send: the
 * bot wants it under 10 min old, and it never refreshes while the app is open
 * (reopening the Mini App renews it). 9.5 min, like the backend's margin.
 */
export function miniAppCanSend(initDataRaw: string | undefined, now = Date.now()): boolean {
  const authDate = initDataAuthDate(initDataRaw);
  return authDate !== null && now / 1000 - authDate <= 570;
}

/** Credential problems the user fixes by reopening the Mini App / logging in again. */
export const isCredentialError = (code: string | undefined) =>
  code === "credential_stale" || code === "credential_rejected";

/** @name, name or a numeric Telegram ID, as typed */
export const normalizeRecipient = (input: string) => input.trim();

/** "Bob Silva (@bob)", "@bob", "Bob Silva" or the id */
export function recipientLabel(r: P2pRecipient | undefined): string {
  if (!r) return "";
  if (r.name && r.username && r.name !== `@${r.username}`) return `${r.name} (@${r.username})`;
  return r.name || (r.username ? `@${r.username}` : String(r.telegram_id));
}
