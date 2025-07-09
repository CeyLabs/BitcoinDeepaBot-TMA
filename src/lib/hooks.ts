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

    const openLink = useCallback(
        (url: string, tryInstantView = false) => {
            if (webApp) {
                webApp.openLink(url, tryInstantView);
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

    return { webApp, closeWebApp, shareStory, openLink };
}

export function usePostRedirect() {
    const redirectInPost = useCallback((fullUrl: string) => {
        try {
            const url = new URL(fullUrl);
            const baseUrl = `${url.origin}${url.pathname}`;

            const form = document.createElement("form");
            form.method = "POST";
            form.action = baseUrl;
            form.target = "_blank";

            url.searchParams.forEach((value, key) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        } catch (error) {
            console.error("Failed to redirect:", error);
        }
    }, []);

    return redirectInPost;
}

export function usePayHereRedirect() {
    const postRedirect = usePostRedirect();

    const redirectToPayHereViaPost = useCallback(
        (payHereParams: Record<string, string>) => {
            // Determine if we're in sandbox or production
            const payHereUrl = "https://sandbox.payhere.lk/pay/checkout";

            // Create URL with search params for our postRedirect function
            const url = new URL(payHereUrl);

            // Add all parameters to URL
            Object.entries(payHereParams).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            postRedirect(url.toString());
        },
        [postRedirect]
    );

    return redirectToPayHereViaPost;
}
