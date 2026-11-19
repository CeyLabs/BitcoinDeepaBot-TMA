/**
 * Bitcoin Deepa @usernames (not Telegram's): how members find each other to
 * send sats. Same rules as the backend (src/modules/user/username.ts).
 */

/** 3-20 chars: lower-case letters, digits and underscores, starting with a letter */
export const USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;

export const USERNAME_RULE = "Use 3-20 letters, digits or underscores, starting with a letter";

/** "@Kasun_77 " → "kasun_77" */
export const normalizeUsername = (value: string) => value.trim().replace(/^@+/, "").toLowerCase();
