const CACHE_VERSION = "v2";
const STATIC_CACHE = `bd-static-${CACHE_VERSION}`;
// Hashed build chunks live in their own cache, capped so old deploys' chunks
// (never requested again) don't pile up forever.
const ASSET_CACHE = `bd-assets-${CACHE_VERSION}`;
const MAX_ASSET_ENTRIES = 200;
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Navigations (HTML documents) are intentionally network-only, never cached.
// This app forces Cache-Control: no-store on HTML routes to work around a
// Telegram Desktop WebView bug that serves stale pages (see next.config.mjs)
// — caching navigations here would reintroduce that exact bug. We only fall
// back to a static offline page when the network request fails outright.
async function handleNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    return (await cache.match(OFFLINE_URL)) ?? Response.error();
  }
}

// Drops the oldest entries (Cache keys come back in insertion order) once the
// cache grows past `max`.
async function trimCache(cache, max) {
  const keys = await cache.keys();
  const excess = keys.length - max;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}

// Hashed Next.js build assets and local images are immutable — safe to
// cache-first. Old deploys' chunks are evicted by trimCache.
async function handleStaticAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    trimCache(cache, MAX_ASSET_ENTRIES).catch(() => {});
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API responses — always fresh, subscription/wallet data included.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(handleStaticAsset(request));
  }
});
