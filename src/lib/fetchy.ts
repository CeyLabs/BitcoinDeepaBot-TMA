/**
 * Thin fetch wrapper for client-side requests (used as TanStack Query's queryFn/mutationFn).
 *
 * - Paths not starting with "/api/" go to the backend (NEXT_PUBLIC_API_BASE_URL),
 *   e.g. fetchy.get("/package"), with credentials (the web session cookie).
 *   "/api/*" stays on this Next.js app.
 * - Web: the HttpOnly session cookie goes along by itself. Mini App: the
 *   session token is added as a Bearer header.
 * - A 401 from the backend ends that session (useSession): web users go back
 *   to sign-in, the Mini App signs in again from initData.
 * - Sends/parses JSON; empty responses (e.g. 204) resolve to undefined.
 * - Throws FetchyError (message + HTTP status) on non-OK responses, so TanStack
 *   Query sees them as errors.
 * - Bypasses the browser HTTP cache — TanStack Query owns caching.
 * - putRaw: sends a file to a presigned storage URL (not JSON, no token).
 */

import { API_BASE_URL } from "@/lib/constants";
import { getMiniAppToken, onUnauthorized } from "@/lib/auth";

type FetchOptions = Omit<RequestInit, "headers" | "body"> & {
  headers?: Record<string, string>;
};

export class FetchyError extends Error {
  constructor(
    message: string,
    public status: number,
    /** The backend's error code, when it sends one (e.g. "relogin_required") */
    public code?: string,
    /** The parsed error body */
    public data?: unknown
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
  const token = backend ? getMiniAppToken() : null;

  const response = await fetch(backend ? `${API_BASE_URL}${url}` : url, {
    cache: "no-store",
    credentials: backend ? "include" : "same-origin",
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

  // A 401 means our session is gone (403 relogin_required is not, but guard
  // the code anyway: it must never sign the user out). Ends only the session
  // this request used — a new one may have started while it was in flight.
  const code = (data as { code?: unknown } | undefined)?.code;
  if (backend && response.status === 401 && code !== "relogin_required") {
    onUnauthorized(token);
  }

  if (!response.ok) {
    const body = data as { message?: string | string[]; code?: unknown } | undefined;
    const raw = body?.message;
    const message = Array.isArray(raw) ? raw.join(", ") : raw;
    throw new FetchyError(
      message || `Request failed with status ${response.status}`,
      response.status,
      typeof body?.code === "string" ? body.code : undefined,
      data
    );
  }

  return data as T;
}

/**
 * PUT a file to an absolute URL as-is (no JSON, no auth header), e.g. a
 * presigned storage upload URL. Throws FetchyError on non-OK responses.
 */
async function putRaw(url: string, body: Blob, headers: Record<string, string> = {}) {
  // https only, except a local S3 server (e.g. MinIO) during development
  if (!/^https:\/\//.test(url) && !/^http:\/\/localhost(:\d+)?\//.test(url)) {
    throw new Error("fetchy.putRaw: only absolute https URLs are allowed");
  }
  const response = await fetch(url, { method: "PUT", cache: "no-store", headers, body });
  if (!response.ok) {
    throw new FetchyError(`Upload failed with status ${response.status}`, response.status);
  }
}

const fetchy = {
  get: <T>(url: string, options?: FetchOptions) => request<T>("GET", url, undefined, options),
  post: <T, B = unknown>(url: string, body?: B, options?: FetchOptions) =>
    request<T>("POST", url, body, options),
  put: <T, B = unknown>(url: string, body?: B, options?: FetchOptions) =>
    request<T>("PUT", url, body, options),
  patch: <T, B = unknown>(url: string, body?: B, options?: FetchOptions) =>
    request<T>("PATCH", url, body, options),
  delete: <T>(url: string, options?: FetchOptions) => request<T>("DELETE", url, undefined, options),
  putRaw,
};

export default fetchy;
