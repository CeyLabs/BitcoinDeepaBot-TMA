"use client";

import dynamic from "next/dynamic";
import { SDKProvider as TMAProvider } from "@telegram-apps/sdk-react";
import { PageTransitionProvider } from "./transition";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const TMASetupProvider = dynamic(() => import("./tma"), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <TMAProvider>
            <TMASetupProvider>
                <QueryClientProvider client={queryClient}>
                    <PageTransitionProvider>{children}</PageTransitionProvider>
                </QueryClientProvider>
            </TMASetupProvider>
        </TMAProvider>
    );
}
