"use client";

import { useTMA } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { initHapticFeedback } from "@telegram-apps/sdk-react";
import { Button } from "@telegram-apps/telegram-ui";
import { IoMdShareAlt } from "react-icons/io";
import { Badge } from "./ui/badge";

export default function ShareStory() {
    const { shareStory } = useTMA();
    const haptic = initHapticFeedback();
    const { userID, count } = useStore();

    const handleClick = () => {
        const mediaUrl = "https://ceyloncash.com/bitcoindeepa/tma/story.mp4";
        const params = {
            text: `Proud OG Member of Bitcoin දීප. ${count} Citizens and Counting 🚀🔥

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
        <Button stretched onClick={handleClick}>
            <span className="flex gap-2">
                Share Story <IoMdShareAlt className="text-xl" />
                <Badge variant="sharestory">+100 sats</Badge>
            </span>
        </Button>
    );
}
