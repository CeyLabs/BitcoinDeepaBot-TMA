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
    // Installed on Android, Chrome takes the system navigation bar's colour
    // (and the launch splash) from these, not from the page: the theme-color
    // meta only reaches the status bar. A manifest can't follow light/dark, so
    // use the dark page colour: a dark bar under the light theme looks fine,
    // a white bar under the dark theme looks broken. Chrome picks up a change
    // when it next updates the installed app (or on reinstall).
    background_color: "#0b0f14",
    theme_color: "#0b0f14",
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
