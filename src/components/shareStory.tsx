"use client";

import fetchy from "@/lib/fetchy";
import { useTMA } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { initHapticFeedback, retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { Button } from "@telegram-apps/telegram-ui";
import React, { useEffect, useState } from "react";
import { IoMdShareAlt } from "react-icons/io";
import { Badge } from "./ui/badge";

export default function ShareStory() {
    const { shareStory } = useTMA();
    const haptic = initHapticFeedback();
    const { userID, count } = useStore();

    // const [position, setPosition] = useState(0);

    // useEffect(() => {
    //     async function fetchPosition() {
    //         const data = await fetchy.get<any>(`/api/user/${userID}`);
    //         setPosition(data.position);
    //     }

    //     fetchPosition();
    // }, [userID]);

    const handleClick = () => {
        const mediaUrl = "https://ceyloncash.com/bitcoindeepa/tma/story.mp4";
        const params = {
            text: `Proud Member of Bitcoin Deepa ${count} 🚀🔥

https://t.me/BitcoinDeepaBot/private_invite?startapp=${userID}

#bitcoindeepa @bitcoindeepabot #viralstory`,
            widget_link: {
                url: `https://t.me/BitcoinDeepaBot/private_invite?startapp=${userID}`,
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
                Share Story <IoMdShareAlt className="text-xl" /><Badge variant="sharestory">+100 sats</Badge>
            </span>
        </Button>
    );
}
