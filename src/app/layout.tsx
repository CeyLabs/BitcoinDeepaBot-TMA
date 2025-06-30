import { Inter } from "next/font/google";
import "@/styles/theme.css";
import "@telegram-apps/telegram-ui/dist/styles.css";
import { AppRoot } from "@telegram-apps/telegram-ui";
import Providers from "./context/providers";
import Script from "next/script";

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
            </head>
            <body className={`${inter.className} min-h-screen bg-[#202020] leading-tight`}>
                <Providers>
                    <AppRoot appearance="dark" id="tg-ui-root">
                        {children}
                    </AppRoot>
                </Providers>
            </body>
        </html>
    );
}
