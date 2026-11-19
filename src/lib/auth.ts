import { API_BASE_URL } from "@/lib/constants";

/**
 * Client-side view of the backend session (BitcoinDeepa-DCA-BE user_session).
 *
 * - Web: the session is the backend's HttpOnly cookie, set by its
 *   "Log In with Telegram" redirect (/auth/telegram/start) and sent with
 *   credentials on our requests. JS never sees a token; GET /auth/me says
 *   whether we're signed in.
 * - Mini App: initData is exchanged once at launch (POST
 *   /auth/telegram/miniapp) for a session token, kept in memory and
 *   sessionStorage (never localStorage or a URL) and sent as a Bearer header.
 *
 * Telegram credentials are never stored here: after login the backend's own
 * session names the user, also to the bot.
 */

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";
export type SessionKind = "web" | "miniapp";

export interface SessionUser {
  id: string;
  /** The member's Bitcoin Deepa @username, when they have one */
  username?: string;
}

export interface SessionSnapshot {
  status: SessionStatus;
  kind: SessionKind | null;
  user: SessionUser | null;
}

/** POST /auth/telegram/miniapp */
export interface MiniAppLoginResponse {
  token: string;
  expiresAt: string;
  absoluteExpiresAt: string;
  user: { telegram_id: string };
  isRegistered: boolean;
  /** The bot linked the wallet at this login (false: bot unreachable) */
  walletLinked: boolean;
  /** New wallets only: false = the bot can't message the user yet */
  canMessage: boolean | null;
}

const MINIAPP_SESSION_KEY = "bitcoin-deepa-session";
/** Pre-session builds kept a 7-day JWT here: removed on load, never read */
const LEGACY_TOKEN_KEY = "bitcoin-deepa-auth-token";
const EXISTING_USER_KEY = "bitcoin-deepa-is-existing-user";

// Fired on the window whenever the session changes (login, logout, a 401).
export const AUTH_CHANGE_EVENT = "bitcoin-deepa-auth-change";

const LOADING: SessionSnapshot = { status: "loading", kind: null, user: null };
const SIGNED_OUT: SessionSnapshot = { status: "unauthenticated", kind: null, user: null };

let snapshot: SessionSnapshot = LOADING;
let miniAppToken: string | null = null;
let webProbe: Promise<void> | null = null;

function emit(next: SessionSnapshot) {
  snapshot = next;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function safeStorage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

// On load: drop the legacy token, and pick up a Mini App session from this
// tab (sessionStorage survives a reload, not a reopen).
if (typeof window !== "undefined") {
  safeStorage("local")?.removeItem(LEGACY_TOKEN_KEY);
  try {
    const raw = safeStorage("session")?.getItem(MINIAPP_SESSION_KEY);
    const saved = raw ? (JSON.parse(raw) as { token?: unknown; user?: SessionUser }) : null;
    if (saved && typeof saved.token === "string" && saved.user?.id) {
      miniAppToken = saved.token;
      snapshot = { status: "authenticated", kind: "miniapp", user: saved.user };
    }
  } catch {
    // Corrupt entry: sign in again from initData
  }
}

export const getSessionSnapshot = (): SessionSnapshot => snapshot;
export const getServerSessionSnapshot = (): SessionSnapshot => LOADING;

export function subscribeSession(onChange: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
}

/** The Mini App's Bearer token (null on the web: the cookie is the session) */
export const getMiniAppToken = (): string | null => miniAppToken;

/**
 * Once the platform is known, settle "loading": the web asks the backend
 * (GET /auth/me, cookie); the Mini App without a saved session is signed
 * out until useRegisterUser exchanges its initData.
 */
export function resolveSession(platform: "telegram" | "web"): void {
  if (snapshot.status !== "loading") return;
  if (platform === "telegram") {
    emit(SIGNED_OUT);
    return;
  }
  void refreshWebSession();
}

/** GET /auth/me with the cookie; deduplicated while one is running */
export function refreshWebSession(): Promise<void> {
  webProbe ??= (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        cache: "no-store",
        credentials: "include",
      });
      if (response.ok) {
        const body = (await response.json()) as {
          user?: { telegram_id?: string; username?: string | null };
        };
        const id = body.user?.telegram_id;
        emit(
          id
            ? {
                status: "authenticated",
                kind: "web",
                user: { id, username: body.user?.username ?? undefined },
              }
            : SIGNED_OUT
        );
      } else {
        emit(SIGNED_OUT);
      }
    } catch {
      emit(SIGNED_OUT);
    } finally {
      webProbe = null;
    }
  })();
  return webProbe;
}

/** Mini App: exchange the raw launch initData (never initDataUnsafe) for a session */
export async function loginWithMiniAppInitData(
  initData: string,
  referralCode?: string
): Promise<MiniAppLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/telegram/miniapp`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(referralCode ? { initData, referral_code: referralCode } : { initData }),
  });
  const result = (await response.json().catch(() => ({}))) as Partial<MiniAppLoginResponse> & {
    message?: string;
  };
  if (!response.ok || !result.token || !result.user?.telegram_id) {
    throw new MiniAppLoginError(response.status, result.message);
  }
  const user = { id: result.user.telegram_id };
  miniAppToken = result.token;
  try {
    safeStorage("session")?.setItem(
      MINIAPP_SESSION_KEY,
      JSON.stringify({ token: result.token, user })
    );
  } catch {
    // Private mode: the session lasts until the tab closes
  }
  markIsExistingUserInStorage();
  emit({ status: "authenticated", kind: "miniapp", user });
  return result as MiniAppLoginResponse;
}

export class MiniAppLoginError extends Error {
  constructor(
    public status: number,
    message?: string
  ) {
    super(message || `Mini App login failed (${status})`);
    this.name = "MiniAppLoginError";
  }
  /** The backend refused the initData itself (too old / invalid): retrying can't help */
  get rejected(): boolean {
    return this.status === 401 || this.status === 400;
  }
}

/** Forget the session locally (after a 401, or logout) */
export function clearSession(): void {
  miniAppToken = null;
  safeStorage("session")?.removeItem(MINIAPP_SESSION_KEY);
  emit(SIGNED_OUT);
}

/**
 * A 401 for a request that carried `sentToken` (null = the web cookie).
 * Only ends the session that request used: a new one may have started while
 * it was in flight.
 */
export function onUnauthorized(sentToken: string | null): void {
  if (snapshot.status !== "authenticated") return;
  if (sentToken !== miniAppToken) return;
  clearSession();
}

/**
 * Revoke this session (or every session) on the backend, then forget it.
 * Throws when the backend didn't confirm it (offline, or e.g. 403 Invalid
 * origin): the HttpOnly cookie and the server session would still be alive,
 * so pretending we logged out would be wrong - the caller tells the user.
 * A 401 means the session was already gone.
 */
export async function logoutSession(all = false): Promise<void> {
  const token = miniAppToken;
  const response = await fetch(`${API_BASE_URL}/auth/${all ? "logout-all" : "logout"}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok && response.status !== 401) {
    throw new Error(`Logout failed (${response.status})`);
  }
  clearSession();
}

/** Where the web login starts (a full-page redirect to Telegram and back) */
export function webLoginUrl(returnTo?: string, referralCode?: string): string {
  const params = new URLSearchParams();
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    params.set("return_to", returnTo);
  }
  if (referralCode) params.set("ref", referralCode);
  const query = params.toString();
  return `${API_BASE_URL}/auth/telegram/start${query ? `?${query}` : ""}`;
}

/** The backend's ?login_error= codes, as user-facing text */
export function loginErrorMessage(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case "cancelled":
      return "Login was cancelled. Try again when you're ready.";
    case "attempt_expired":
    case "bad_state":
      return "That login link expired. Please try again.";
    case "missing_telegram_id":
      return "Telegram didn't share your account ID. Please try again.";
    case "not_configured":
      return "Telegram login isn't available right now.";
    case "rate_limited":
      return "Too many attempts. Please wait a minute and try again.";
    default:
      return "Couldn't sign you in with Telegram. Please try again.";
  }
}

// ---- "Returning user" flag (UX only, not a credential) ----
// Read by LAUNCH_REDIRECT_SCRIPT to skip the landing page in the Mini App.

export const getIsExistingUserFromStorage = (): boolean =>
  safeStorage("local")?.getItem(EXISTING_USER_KEY) === "true";

export const markIsExistingUserInStorage = () => {
  safeStorage("local")?.setItem(EXISTING_USER_KEY, "true");
};

export const clearIsExistingUserInStorage = () => {
  safeStorage("local")?.removeItem(EXISTING_USER_KEY);
};
