"use client";

import fetchy from "@/lib/fetchy";
import { Headline } from "@telegram-apps/telegram-ui";
import { useEffect, useState } from "react";

export default function UserCount() {
    const [userCount, setUserCount] = useState(0);

    useEffect(() => {
        async function fetchUserCount() {
            const data = await fetchy.get<any>("/api/user");
            setUserCount(data.count);
        }
        fetchUserCount();
    }, []);

    return <Headline>{userCount} Joined</Headline>;
}
