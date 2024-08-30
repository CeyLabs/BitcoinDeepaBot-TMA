"use client";

import { useTMA } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { initHapticFeedback, retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { Button } from "@telegram-apps/telegram-ui";
import React, { useEffect, useState } from "react";
import { IoMdShareAlt } from "react-icons/io";

export default function ShareStory() {
    const { shareStory } = useTMA();
    const haptic = initHapticFeedback();
    const { userID } = useStore();

    const [position, setPosition] = useState(0);

    useEffect(() => {
        async function fetchPosition() {
            const response = await fetch(`/api/user/${userID}`);
            const data = await response.json();
            setPosition(data.position);
        }

        fetchPosition();
    }, [userID]);

    const handleClick = () => {
        const mediaUrl = "https://ceyloncash.com/bitcoindeepa/tma/story.mp4";
        const params = {
            text: `Proud Member of Bitcoin Deepa #${position} 🚀🔥

#bitcoindeepa @bitcoindeepa #viralstory`,
            widget_link: {
                url: "https://t.me/BitcoinDeepaBot/private_invite",
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
