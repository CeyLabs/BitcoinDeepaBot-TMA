import type { ConfirmOptions } from "./types";

export type ConfirmRequest = ConfirmOptions & { resolve: (confirmed: boolean) => void };

// platform.confirm() is a plain async function (no React context), so it
// hands requests to the mounted <ConfirmHost /> through this listener.
let listener: ((request: ConfirmRequest) => void) | null = null;

/** Called by <ConfirmHost /> on mount. Returns the unsubscribe fn. */
export function onConfirmRequest(onRequest: (request: ConfirmRequest) => void): () => void {
  listener = onRequest;
  return () => {
    if (listener === onRequest) listener = null;
  };
}

/**
 * In-app confirmation sheet. Used on the web and as the fallback when
 * Telegram's native popup isn't available, instead of window.confirm.
 */
export function requestConfirm(options: ConfirmOptions): Promise<boolean> {
  const show = listener;
  if (!show) {
    // Host not mounted (shouldn't happen inside Providers) - last resort.
    return Promise.resolve(window.confirm(`${options.title}\n\n${options.message}`));
  }
  return new Promise((resolve) => show({ ...options, resolve }));
}
