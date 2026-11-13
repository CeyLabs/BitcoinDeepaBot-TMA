/**
 * fetchy is a utility class for making HTTP requests with built-in error handling.
 * It provides methods for common HTTP methods: GET, POST, PUT, and DELETE.
 *
 * Features:
 * - Automatically sets 'Content-Type' to 'application/json'.
 * - Automatically parses JSON response.
 * - Supports optional cache control using the `shouldCache` option.
 * - Handles HTTP errors by throwing a FetchyError (message + HTTP status).
 * - Paths not starting with "/api/" go to the backend (NEXT_PUBLIC_API_BASE_URL).
 * - Returns a Promise, allowing use of .then(), .catch(), and .finally().
 * - Supports TypeScript generics for type-safe responses and request bodies.
 *
 * Usage:
 * - `fetchy.get<T>(url, options)`: Sends a GET request.
 * - `fetchy.post<T, B>(url, body, options)`: Sends a POST request with a JSON body.
 * - `fetchy.put<T, B>(url, body, options)`: Sends a PUT request with a JSON body.
 * - `fetchy.delete<T>(url, options)`: Sends a DELETE request.
 *
 * Options:
 * - You can pass additional fetch options (headers, etc.) through the `options` parameter.
 * - Use `shouldCache: false` in `options` to disable caching.
 *
 * Example:
 * fetchy.get<UserData>('https://api.example.com/user')
 *   .then(data => console.log(data))
 *   .catch(error => console.error(error))
 *   .finally(() => console.log('Request completed'));
 *
 * Note:
 * - The type parameter T is optional. If not provided, the return type defaults to Promise<any>.
 * - You can use these methods without specifying types: fetchy.get(url)
 */

import { API_BASE_URL } from "@/lib/constants";

interface FetchOptions extends RequestInit {
  shouldCache?: boolean;
  headers?: Record<string, string>;
}

interface ErrorResponse {
  message?: string | string[];
}

export class FetchyError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "FetchyError";
  }
}

// Paths not starting with "/api/" (Next.js routes still served by this app)
// go to the backend, e.g. fetchy.get("/package").
function resolveUrl(url: string): string {
  if (/^https?:\/\//.test(url) || url.startsWith("/api/")) return url;
  return `${API_BASE_URL}${url}`;
}

class Fetchy {
  private async request<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const { shouldCache = true, headers, ...fetchOptions } = options;

    const response = await fetch(resolveUrl(url), {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(shouldCache ? {} : { cache: "no-cache" }),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as ErrorResponse;
      const message = Array.isArray(error.message) ? error.message.join(", ") : error.message;
      throw new FetchyError(
        message || "An error occurred while fetching the data.",
        response.status
      );
    }

    return response.json() as Promise<T>;
  }

  get<T>(url: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  post<T, B = unknown>(url: string, body: B, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put<T, B = unknown>(url: string, body: B, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete<T>(url: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }
}

const fetchy = new Fetchy();

export default fetchy as {
  get<T>(url: string, options?: FetchOptions): Promise<T>;
  post<T, B = unknown>(url: string, body: B, options?: FetchOptions): Promise<T>;
  put<T, B = unknown>(url: string, body: B, options?: FetchOptions): Promise<T>;
  delete<T>(url: string, options?: FetchOptions): Promise<T>;
};
