"use client";

import fetchy from "@/lib/fetchy";
import { Headline, Progress } from "@telegram-apps/telegram-ui";
import { useEffect, useState } from "react";
import TextTicker from "./TextTicker";

export default function UserCount() {
    const [userCount, setUserCount] = useState(0);

    useEffect(() => {
        async function fetchUserCount() {
            const data = await fetchy.get<any>("/api/user");
            console.log(data.count);
            setUserCount((data.count as number) || 20);
        }
        fetchUserCount();
    }, []);

    return (
        <div className="w-full px-3 pt-10 text-5xl font-semibold tabular-nums tracking-tight">
            <Progress
                value={userCount}
                style={{
                    backgroundColor: "#212A33",
                    height: "7px",
                }}
            />
            <div className="flex w-full justify-between text-3xl">
                <p className="text-left leading-tight">
                    {userCount}
                    <span className="pl-1 text-sm font-normal text-gray-400">Joined</span>
                </p>
                <p className="text-gray-400">100</p>
            </div>
        </div>
    );
}
