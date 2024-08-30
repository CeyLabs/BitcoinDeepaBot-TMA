"use client";

import { useEffect, useMemo } from "react";
import { initMiniApp, postEvent, useInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import fetchy from "@/lib/fetchy";
import { useStore } from "@/lib/store";

export default function TMASetupProvider({ children }: { children: React.ReactNode }) {
    const initLaunchParams = useLaunchParams().initData;
    const initData = useInitData();
    const { setUserID } = useStore();

    const authData = useMemo(() => {
        return initLaunchParams || initData;
    }, [initLaunchParams, initData]);

    useEffect(() => {
        const { username, id } = authData?.user || {};

        async function addUserToDb() {
            await fetchy.post("/api/user", {
                id: id,
                username: username,
                data: authData,
            });
        }
        addUserToDb();
        setUserID(id?.toString() || "");
    }, [authData]);

    useEffect(() => {
        const [miniApp] = initMiniApp();

        miniApp.setHeaderColor("#202020");

        postEvent("web_app_expand");
    }, []);

    return <>{children}</>;
}
