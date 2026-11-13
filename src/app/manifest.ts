import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Stable app identity — never change it after launch, or every install
    // becomes a different app.
    id: "/",
    name: "Bitcoin Deepa",
    short_name: "Bitcoin Deepa",
    description:
      "Bitcoin membership reward accrual with subscription management for Sri Lankan users.",
    // "/" routes signed-in users to the wallet and everyone else to sign-in.
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Android builds its launch splash from these; the page's theme-color
    // meta (light/dark, see layout.tsx) takes over once loaded.
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["finance"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Long-press menu on the home screen icon.
    shortcuts: [
      { name: "Wallet", url: "/dashboard?tab=wallet" },
      { name: "Plans", url: "/dashboard/plans" },
    ],
  };
}
