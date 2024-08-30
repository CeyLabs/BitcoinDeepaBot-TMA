import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/theme.css";
import "@telegram-apps/telegram-ui/dist/styles.css";
import { AppRoot, Title } from "@telegram-apps/telegram-ui";
import Image from "next/image";
import Providers from "./context/providers";

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
            <body className={`${inter.className} grid min-h-screen p-5 leading-tight bg-black`}>
                <Providers>
                    <AppRoot>
                        <section className="flex flex-col items-center justify-center text-center">
                            <Image src="/logo.png" width={300} height={300} alt="Bitcoin Deepa" />
                            <p className="text-gray-500">#Bitcoinදීප</p>
                            <Title weight="2">
                                Join Sri Lanka's First and Largest Bitcoin Community
                            </Title>
                        </section>
                        {children}
                    </AppRoot>
                </Providers>
            </body>
        </html>
    );
}
