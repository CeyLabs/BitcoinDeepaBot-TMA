/**
 * Thin fetch wrapper for client-side requests (used as TanStack Query's queryFn/mutationFn).
 *
 * - Paths not starting with "/api/" go to the backend (NEXT_PUBLIC_API_BASE_URL),
 *   e.g. fetchy.get("/package"). "/api/*" stays on this Next.js app.
 * - Backend requests automatically carry the stored auth token as a Bearer header.
 * - Sends/parses JSON; empty responses (e.g. 204) resolve to undefined.
 * - Throws FetchyError (message + HTTP status) on non-OK responses, so TanStack
 *   Query sees them as errors.
 * - Bypasses the browser HTTP cache — TanStack Query owns caching.
 */

import { API_BASE_URL } from "@/lib/constants";
import { getAuthTokenFromStorage } from "@/lib/auth";

type FetchOptions = Omit<RequestInit, "headers" | "body"> & {
  headers?: Record<string, string>;
};

export class FetchyError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "FetchyError";
  }
}

// Backend paths: a single leading "/" (not "//", which is protocol-relative
// and would hit another host), excluding this app's own "/api/" routes.
const isBackendPath = (url: string) => /^\/(?!\/)/.test(url) && !url.startsWith("/api/");
const isAllowedUrl = (url: string) => url.startsWith("/api/") || /^https?:\/\//.test(url);

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  options: FetchOptions = {}
): Promise<T> {
  const { headers, ...rest } = options;
  const backend = isBackendPath(url);
  if (!backend && !isAllowedUrl(url)) {
    throw new Error(`fetchy: unsupported URL "${url}"`);
  }
  if (backend && !API_BASE_URL) {
    throw new Error("fetchy: NEXT_PUBLIC_API_BASE_URL is not set");
  }
  const token = backend ? getAuthTokenFromStorage() : null;

  const response = await fetch(backend ? `${API_BASE_URL}${url}` : url, {
    cache: "no-store",
    ...rest,
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const raw = (data as { message?: string | string[] } | undefined)?.message;
    const message = Array.isArray(raw) ? raw.join(", ") : raw;
    throw new FetchyError(
      message || `Request failed with status ${response.status}`,
      response.status
    );
  }

  return data as T;
}

const fetchy = {
  get: <T>(url: string, options?: FetchOptions) => request<T>("GET", url, undefined, options),
  post: <T, B = unknown>(url: string, body?: B, options?: FetchOptions) =>
    request<T>("POST", url, body, options),
  put: <T, B = unknown>(url: string, body?: B, options?: FetchOptions) =>
    request<T>("PUT", url, body, options),
  delete: <T>(url: string, options?: FetchOptions) => request<T>("DELETE", url, undefined, options),
};

export default fetchy;
