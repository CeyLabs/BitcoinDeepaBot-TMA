import { API_BASE_URL } from "@/lib/constants";

export interface TelegramAuthResponse {
  token?: string;
  user?: any;
  isRegistered?: boolean;
  message?: string;
}

/**
 * Payload Telegram's Login library (https://core.telegram.org/bots/telegram-login)
 * passes to the onauth callback — distinct from Mini App initData, this is
 * used for browser-based sign-in outside Telegram. id_token is a signed JWT
 * that must be verified server-side (JWKS) before the claims in `user` are trusted.
 */
export interface TelegramOidcAuthData {
  id_token?: string;
  user?: {
    id: number;
    name?: string;
    given_name?: string;
    family_name?: string;
    preferred_username?: string;
    picture?: string;
  };
  error?: string;
}

/**
 * Authenticate user with Telegram initData
 */
export async function authenticateWithTelegram(initData: string): Promise<TelegramAuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initData,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // If it's a 404 or 401, it might mean user is not registered
      if (response.status === 404 || response.status === 401) {
        return {
          token: result.token || null,
          isRegistered: false,
          message: result.message || "User not found",
        };
      }
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    return {
      token: result.token,
      user: result.user,
      isRegistered: false,
    };
  } catch (error) {
    console.error("Error during Telegram authentication:", error);
    throw error;
  }
}

/**
 * Authenticate a user via Telegram's Login (OIDC) library (browser flow, outside Telegram).
 * Sends the raw id_token — the backend verifies its signature against Telegram's
 * JWKS before trusting any claims in it.
 */
export async function authenticateWithTelegramOidc(idToken: string): Promise<TelegramAuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/telegram-oidc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_token: idToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || "Telegram login failed");
    }

    return {
      token: result.token,
      user: result.user,
      isRegistered: result.isRegistered ?? true,
    };
  } catch (error) {
    console.error("Error during Telegram OIDC authentication:", error);
    throw error;
  }
}

/**
 * Utility functions for authentication using localStorage
 */

export const getAuthTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bitcoin-deepa-auth-token");
};

export const getIsExistingUserFromStorage = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("bitcoin-deepa-is-existing-user") === "true";
};

/**
 * Persists the "returning user" flag on its own, independent of an auth
 * token — used by the /api/user existing-check (409 response), which never
 * hands back a token. Cached so future launches can skip the network round
 * trip entirely and redirect straight to the dashboard.
 */
export const markIsExistingUserInStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem("bitcoin-deepa-is-existing-user", "true");
};

/**
 * Clears the returning-user flag — used when the server tells us the id we
 * thought was registered actually wasn't (a stale cache from a deleted
 * account or DB reset), so the next launch stops trusting it.
 */
export const clearIsExistingUserInStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("bitcoin-deepa-is-existing-user");
};

// Fired on the window whenever the stored auth token is set or cleared, so
// components can react to a token that arrives after they've mounted (the
// TMA mints it asynchronously in useRegisterUser).
export const AUTH_CHANGE_EVENT = "bitcoin-deepa-auth-change";

export const saveAuthToStorage = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("bitcoin-deepa-auth-token", token);
  localStorage.setItem("bitcoin-deepa-is-existing-user", "true");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const clearAuthFromStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("bitcoin-deepa-auth-token");
  localStorage.removeItem("bitcoin-deepa-is-existing-user");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const isAuthenticated = (): boolean => {
  return !!getAuthTokenFromStorage();
};

/**
 * Decodes the stored JWT's payload for identity ({ id, username }) without
 * verifying it — used as a fallback source of identity outside Telegram,
 * where there's no initData to read from. Both auth flows (initData and
 * the Login Widget) mint tokens with the same payload shape, so this works
 * regardless of which one signed the user in.
 */
export const getUserFromToken = (): { id: string; username?: string } | null => {
  const token = getAuthTokenFromStorage();
  if (!token) return null;

  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;

    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    const payload = JSON.parse(json);

    return typeof payload.id === "string" ? { id: payload.id, username: payload.username } : null;
  } catch {
    return null;
  }
};
