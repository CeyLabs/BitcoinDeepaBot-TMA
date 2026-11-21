export const TELEGRAM_BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "BitcoinDeepaBot";

export const TELEGRAM_BOT_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

/**
 * Short name of the bot's Mini App (BotFather > Bot Settings > Configure Mini
 * App). Links to it open the Mini App itself, not the bot chat.
 */
export const TELEGRAM_MINI_APP_NAME =
  process.env.NEXT_PUBLIC_TELEGRAM_MINI_APP_NAME || "private_invite";

/** Opens the Mini App directly (t.me link: the Telegram app, or Telegram Web). */
export const TELEGRAM_MINI_APP_URL = `${TELEGRAM_BOT_URL}/${TELEGRAM_MINI_APP_NAME}`;

/** Same, as a tg:// deep link that goes straight into the installed Telegram app. */
export const TELEGRAM_MINI_APP_DEEP_LINK = `tg://resolve?domain=${encodeURIComponent(
  TELEGRAM_BOT_USERNAME
)}&appname=${encodeURIComponent(TELEGRAM_MINI_APP_NAME)}`;

/** Personal invite link: opens the Mini App with the inviter's id as start param. */
export const getInviteUrl = (userId: string) =>
  `${TELEGRAM_MINI_APP_URL}?startapp=${encodeURIComponent(userId)}`;

// Base URL of the BitcoinDeepa-DCA-BE backend, called directly from the
// browser with credentials (its CORS allows this app's origin, APP_URL).
// Baked in at build time.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
