"use client";

import { SDKProvider as TMAProvider } from "@telegram-apps/sdk-react";
import dynamic from "next/dynamic";

const TMASetupProvider = dynamic(() => import("./tma"), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <TMAProvider>
            <TMASetupProvider>{children}</TMASetupProvider>
        </TMAProvider>
    );
}
