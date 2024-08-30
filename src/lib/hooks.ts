import { useState, useEffect, useCallback } from "react";

declare global {
    interface Window {
        Telegram?: {
            WebApp?: any;
        };
    }
}

type storyParams = {
    text: string;
    widget_link: {
        url: string;
        name: string;
    };
};

export function useTMA() {
    const [webApp, setWebApp] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
            setWebApp(window.Telegram.WebApp);
        }
    }, []);

    const shareStory = useCallback(
        (mediaUrl: string, params: storyParams) => {
            if (webApp) {
                webApp.shareToStory(mediaUrl, params);
            } else {
                throw new Error("TMA not available");
            }
        },
        [webApp]
    );

    const closeWebApp = useCallback(() => {
        if (webApp) {
            webApp.close();
        } else {
            throw new Error("TMA not available");
        }
    }, [webApp]);

    return { webApp, closeWebApp, shareStory };
}
