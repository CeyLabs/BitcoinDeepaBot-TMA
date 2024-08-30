"use client";

import { useTMA } from "@/lib/hooks";
import { initHapticFeedback, retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { Button } from "@telegram-apps/telegram-ui";
import React from "react";
import { IoMdShareAlt } from "react-icons/io";

export default function ShareStory() {
    const { shareStory, closeWebApp } = useTMA();
    const { startParam } = retrieveLaunchParams();
    const haptic = initHapticFeedback();

    const handleClick = () => {
        const mediaUrl = "https://ceyloncash.com/bitcoindeepa/tma/story.mp4";
        const params = {
            text: `#ViralStory #CeyLabs `,
            widget_link: {
                url: "https://example.com",
                name: "Inner Circle Entry",
            },
        };
        haptic.impactOccurred("heavy");
        shareStory(mediaUrl, params);
    };

    return (
        <Button
            style={{
                backgroundColor: "#FF9900",
            }}
            stretched
            onClick={handleClick}
        >
            <span className="flex gap-2">
                Share Story <IoMdShareAlt className="text-xl" />
            </span>
        </Button>
    );
}
