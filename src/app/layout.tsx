import { Inter } from "next/font/google";
import "@/styles/theme.css";
import "@telegram-apps/telegram-ui/dist/styles.css";
import { AppRoot } from "@telegram-apps/telegram-ui";
import Providers from "./context/providers";
import Script from "next/script";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <Script
                    src="https://telegram.org/js/telegram-web-app.js"
                    strategy="beforeInteractive"
                />
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
                <Providers>
                    <AppRoot platform="base" id="tg-ui-root">
                        {children}
                        <Toaster position="top-center" richColors />
                    </AppRoot>
                </Providers>
            </body>
        </html>
    );
}
