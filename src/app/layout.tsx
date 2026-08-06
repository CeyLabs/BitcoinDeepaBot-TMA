import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/theme.css";
import "@telegram-apps/telegram-ui/dist/styles.css";
import Providers from "./context/providers";
import { RegisterServiceWorker } from "./register-sw";
import Script from "next/script";
import { cn } from "@/lib/cn";

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
  themeColor: "#fa7119",
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
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZJK26JTL2R"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-ZJK26JTL2R');
                    `}
        </Script>
      </head>
      <body className={`${inter.className} min-h-screen leading-tight`}>
        <RegisterServiceWorker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
