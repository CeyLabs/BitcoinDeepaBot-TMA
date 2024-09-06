import { Inter } from "next/font/google";
import "@/styles/theme.css";
import "@telegram-apps/telegram-ui/dist/styles.css";
import { AppRoot, Title } from "@telegram-apps/telegram-ui";
import Image from "next/image";
import Providers from "./context/providers";
import Script from "next/script";
import UserCount from "@/components/usercount";

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
            <body className={`${inter.className} grid min-h-screen bg-[#202020] p-5 leading-tight`}>
                <Providers>
                    <AppRoot appearance="dark" id="tg-ui-root">
                        <section className="flex flex-col items-center justify-center text-center">
                            <Image src="/logo.png" width={250} height={250} alt="Bitcoin Deepa" />
                            <Title weight="2">
                                Join Sri Lanka&apos;s First and Largest Bitcoin Community
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
