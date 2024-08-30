"use client";

import fetchy from "@/lib/fetchy";
import { Headline } from "@telegram-apps/telegram-ui";
import { useEffect, useState } from "react";
import TextTicker from "./TextTicker";

export default function UserCount() {
    const [userCount, setUserCount] = useState(5);

    useEffect(() => {
        async function fetchUserCount() {
            const data = await fetchy.get<any>("/api/user");
            setUserCount(data.count);
        }
        fetchUserCount();
    }, []);

    return (
        <div className="text-2xl font-semibold tabular-nums tracking-tight">
            <TextTicker value={userCount} />
        </div>
    );
}
