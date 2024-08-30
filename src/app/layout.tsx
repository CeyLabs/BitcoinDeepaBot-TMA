import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/theme.css";
import "@telegram-apps/telegram-ui/dist/styles.css";
import { AppRoot, Title } from "@telegram-apps/telegram-ui";
import Image from "next/image";
import Providers from "./context/providers";
import Script from "next/script";
import UserCount from "@/components/usercount";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Create Next App",
};

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
            <body className={`${inter.className} grid min-h-screen p-5 leading-tight bg-[#202020]`}>
                <Providers>
                    <AppRoot appearance='dark'>
                        <section className="flex flex-col items-center justify-center text-center">
                            <Image src="/logo.png" width={300} height={300} alt="Bitcoin Deepa" />
                            <p className="text-gray-500">#Bitcoinදීප</p>
                            <Title weight="2">
                                Join Sri Lanka's First and Largest Bitcoin Community
                            </Title>
                            <UserCount />
                        </section>
                        {children}
                    </AppRoot>
                </Providers>
            </body>
        </html>
    );
}
