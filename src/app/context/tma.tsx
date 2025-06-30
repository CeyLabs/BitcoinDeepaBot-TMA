"use client";

import { useEffect } from "react";
import { initMiniApp, postEvent } from "@telegram-apps/sdk-react";

export default function TMASetupProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const [miniApp] = initMiniApp();

        miniApp.setHeaderColor("#202020");

        postEvent("web_app_expand");
    }, []);

    return <>{children}</>;
}
