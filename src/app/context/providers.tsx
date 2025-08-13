"use client";

import dynamic from "next/dynamic";
import { SDKProvider as TMAProvider } from "@telegram-apps/sdk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const TMASetupProvider = dynamic(() => import("./tma"), { ssr: false });
const ThemeProvider = dynamic(() => import("./theme"), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <TMAProvider>
            <TMASetupProvider>
                <ThemeProvider>
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                </ThemeProvider>
            </TMASetupProvider>
        </TMAProvider>
    );
}
