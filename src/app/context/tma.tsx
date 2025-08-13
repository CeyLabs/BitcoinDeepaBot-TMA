"use client";

import { useEffect } from "react";
import { initMiniApp, postEvent } from "@telegram-apps/sdk-react";

export default function TMASetupProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const [miniApp] = initMiniApp();

        postEvent("web_app_expand");
    }, []);

    return <>{children}</>;
}
