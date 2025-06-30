"use client";

import dynamic from "next/dynamic";
import { SDKProvider as TMAProvider } from "@telegram-apps/sdk-react";
import { PageTransitionProvider } from "./transition";

const TMASetupProvider = dynamic(() => import("./tma"), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <TMAProvider>
            <TMASetupProvider>
                <PageTransitionProvider>{children}</PageTransitionProvider>
            </TMASetupProvider>
        </TMAProvider>
    );
}
