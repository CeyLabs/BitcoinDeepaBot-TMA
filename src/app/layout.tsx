import type { Metadata, Viewport } from "next";
import { Noto_Sans_Sinhala, Nunito_Sans, Ubuntu } from "next/font/google";
import "@/styles/theme.css";
import Providers from "./context/providers";
import { PwaSetup } from "@/pwa";
import { THEME_BOOT_SCRIPT } from "@/lib/theme-boot";
import { EARLY_READY_SCRIPT, LAUNCH_REDIRECT_SCRIPT } from "@/lib/launch-redirect";
import { preconnect } from "react-dom";
import { API_BASE_URL } from "@/lib/constants";
import Script from "next/script";
import { cn } from "cn";

// Google Analytics is opt-in per deployment, so forks don't report to ours.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Brand type: Nunito Sans for text, Ubuntu for headings and numbers.
const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});
// The rupee sign (රු.) and Sinhala copy; Nunito and Ubuntu have no Sinhala glyphs.
const sinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "600", "700"],
  variable: "--font-sinhala",
});
const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-ubuntu",
});

export const metadata: Metadata = {
  title: "Bitcoin Deepa",
  description:
    "Bitcoin membership reward accrual with subscription management for Sri Lankan users.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bitcoin Deepa",
  },
};

export const viewport: Viewport = {
  // Draw edge to edge; safe-area padding is applied in styles/theme.css.
  viewportFit: "cover",
  // Status bar / browser chrome matches the page background.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eeeff3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Open the backend connection (DNS + TLS) while the JS downloads, so the
  // first API call doesn't pay for it. React 19 puts this in <head>.
  if (API_BASE_URL) preconnect(API_BASE_URL, { crossOrigin: "anonymous" });

  return (
    <html
      lang="en"
      className={cn("font-sans", nunito.variable, ubuntu.variable, sinhala.variable)}
      suppressHydrationWarning
    >
      <head>
        {/* Returning members skip the landing page (see lib/launch-redirect.ts). */}
        <script dangerouslySetInnerHTML={{ __html: LAUNCH_REDIRECT_SCRIPT }} />
        {/* Sets <html data-theme> before first paint (see lib/theme-boot.ts). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {/* Telegram iOS WebView sometimes ignores the Cache-Control response header (see next.config.mjs) but respects this meta tag instead. */}
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', ${JSON.stringify(GA_ID)});
              `}
            </Script>
          </>
        )}
      </head>
      <body className="bg-background text-foreground min-h-screen font-sans leading-normal antialiased">
        <PwaSetup />
        <Providers>{children}</Providers>
        {/* Reveal the server-rendered page inside Telegram right away (see lib/launch-redirect.ts). */}
        <script dangerouslySetInnerHTML={{ __html: EARLY_READY_SCRIPT }} />
      </body>
    </html>
  );
}
