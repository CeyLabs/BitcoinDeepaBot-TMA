"use client";

import { useState } from "react";
import { Button } from "@telegram-apps/telegram-ui";
import { IoCopyOutline } from "react-icons/io5";
import { initUtils } from "@telegram-apps/sdk-react";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import { useInitData } from "@telegram-apps/sdk-react";
import { useStore } from "@/lib/store";

export function CopyLink() {
    const initData = useInitData();
    const [buttonText, setButtonText] = useState(
        `t.me/bitcoindeepabot/private_invite?startapp=${initData?.user?.id}`
    );
    const link = `t.me/bitcoindeepabot/private_invite?startapp=${initData?.user?.id}`;

    const copyToClipboard = () => {
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setButtonText("Copied!");
                setTimeout(() => {
                    setButtonText(link);
                }, 1000);
            })
            .catch((error) => {
                console.error("Failed to copy the link: ", error);
            });
    };

    return (
        <Button mode="gray" stretched onClick={copyToClipboard}>
            <span className="flex gap-2 text-[10.7px] font-light">
                {buttonText}
                {buttonText !== "Copied!" && <IoCopyOutline className="absolute right-3 text-xl" />}
            </span>
        </Button>
    );
}

export function ShareOn_X_WhatsApp() {
    const utils = initUtils();
    const { userID } = useStore();

    return (
        <>
            <Button
                onClick={() =>
                    utils.openLink(
                        `https://twitter.com/intent/tweet?text=%F0%9F%9A%80%20Here%E2%80%99s%20a%20link%20to%20get%20some%20Free%20Satoshis,%20the%20bitcoin%20wallet%20I%20was%20telling%20you%20about!%0A%0A%F0%9F%94%97%20https://t.me/bitcoindeepabot/private_invite?startapp=${userID}`,
                        { tryBrowser: true }
                    )
                }
                mode="gray"
            >
                <FaXTwitter />
            </Button>
            <Button
                onClick={() =>
                    utils.openLink(
                        `https://api.whatsapp.com/send?text=%F0%9F%9A%80%20Here%E2%80%99s%20a%20link%20to%20get%20some%20Free%20Satoshis%2C%20the%20bitcoin%20wallet%20I%20was%20telling%20you%20about!%0A%0A%F0%9F%94%97%20https%3A%2F%2Ft.me%2Fbitcoindeepabot%2Fprivate_invite%3Fstartapp=${userID}`,
                        { tryBrowser: true }
                    )
                }
                mode="gray"
            >
                <FaWhatsapp />
            </Button>
        </>
    );
}
