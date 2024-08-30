"use client";

import { useTMA } from "@/lib/hooks";
import { initHapticFeedback, retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { Button } from "@telegram-apps/telegram-ui";
import React, { useState } from "react";

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
                name: "Share Story",
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
            Share Story
        </Button>
    );
}
