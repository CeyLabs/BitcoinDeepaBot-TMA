/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.sats.day", "*.ngrok-free.app"],
  experimental: {
    // Since Next 15, page segments aren't reused across Link/router.push
    // navigation by default (only layouts + true back/forward are). This
    // lets the news list <-> article navigation reuse the client RSC cache
    // instead of re-requesting the server on every tap.
    staleTimes: {
      dynamic: 60,
      static: 900,
    },
  },
  async headers() {
    return [
      {
        // Telegram Desktop's webview caches the HTML document itself,
        // so it keeps serving stale pages even after a restart. Force
        // revalidation on every route except the hashed build assets.
        source: "/((?!_next/static|_next/image).*)",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      {
        // Service worker script: never cache (so updates ship immediately)
        // and lock down what it's allowed to load.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
