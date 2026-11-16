// After a deploy, a tab still running the previous build can request a JS
// chunk it hasn't loaded yet — and Railway only serves the new build's
// chunks, so it fails. A reload picks up the new build. This applies on the
// checkout/KYC/payment screens too (where register-sw defers its update
// reload): a reload is better than a page that can't load its code.

const RELOAD_KEY = "bd-chunk-reload-at";
// Don't reload again within this window, so a chunk that's genuinely missing
// can't cause a reload loop.
const MIN_INTERVAL_MS = 10_000;

const CHUNK_ERROR =
  /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i;

function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < MIN_INTERVAL_MS) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage unavailable — still reload; worst case one extra reload.
  }
  location.reload();
}

let started = false;

export function reloadOnChunkLoadError() {
  if (started) return;
  started = true;

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as { name?: string; message?: string } | undefined;
    if (CHUNK_ERROR.test(`${reason?.name ?? ""} ${reason?.message ?? ""}`)) reloadOnce();
  });

  // <script> load failures don't bubble; listen in the capture phase.
  window.addEventListener(
    "error",
    (event) => {
      const target = event.target as HTMLScriptElement | null;
      if (target?.tagName === "SCRIPT" && target.src.includes("/_next/static/")) reloadOnce();
    },
    true
  );
}
