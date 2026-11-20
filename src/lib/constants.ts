export const TELEGRAM_BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "BitcoinDeepaBot";

export const TELEGRAM_BOT_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

/** Personal invite link: opens the Mini App with the inviter's id as start param. */
export const getInviteUrl = (userId: string) =>
  `${TELEGRAM_BOT_URL}/private_invite?startapp=${encodeURIComponent(userId)}`;

// Base URL of the BitcoinDeepa-DCA-BE backend, called directly from the
// browser with credentials (its CORS allows this app's origin, APP_URL).
// Baked in at build time.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
