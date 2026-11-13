export const TELEGRAM_BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "BitcoinDeepaBot";

export const TELEGRAM_BOT_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

// Client ID for Telegram Login (OIDC), from @BotFather -> bot -> Login Widget.
// Public identifier, not a secret — see https://core.telegram.org/bots/telegram-login
export const TELEGRAM_CLIENT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CLIENT_ID || "";

// Base URL of the BitcoinDeepa-DCA-BE backend, called directly from the browser
// (backend has CORS enabled). Baked in at build time.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
