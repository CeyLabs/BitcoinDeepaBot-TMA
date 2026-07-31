/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.sats.day", "*.ngrok-free.app"],
  async headers() {
    return [
      {
        // Telegram Desktop's webview caches the HTML document itself,
        // so it keeps serving stale pages even after a restart. Force
        // revalidation on every route except the hashed build assets.
        source: "/((?!_next/static|_next/image).*)",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
