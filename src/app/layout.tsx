import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/theme.css";
import "@telegram-apps/telegram-ui/dist/styles.css";
import Providers from "./context/providers";
import { PwaSetup } from "@/pwa";
import Script from "next/script";
import { cn } from "@/lib/cn";

// Google Analytics is opt-in per deployment, so forks don't report to ours.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1b2027" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <head>
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
      <body className={`${inter.className} min-h-screen leading-tight`}>
        <PwaSetup />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
