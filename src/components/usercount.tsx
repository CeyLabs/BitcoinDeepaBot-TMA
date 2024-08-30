"use client";

import fetchy from "@/lib/fetchy";
import { Progress } from "@telegram-apps/telegram-ui";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export default function UserCount() {
    const { count, setCount } = useStore();

    useEffect(() => {
        async function fetchUserCount() {
            const data = await fetchy.get<any>("/api/user");
            console.log(data.count);
            setCount((data.count as number) || 20);
        }
        fetchUserCount();
    }, []);

    return (
        <div className="w-full px-3 pt-10 text-5xl font-semibold tabular-nums tracking-tight">
            <Progress
                value={count}
                style={{
                    backgroundColor: "#212A33",
                    height: "7px",
                }}
            />
            <div className="flex w-full justify-between text-3xl">
                <p className="text-left leading-tight">
                    {count}
                    <span className="pl-1 text-sm font-normal text-gray-400">Joined</span>
                </p>
                <p className="text-gray-400">100</p>
            </div>
        </div>
    );
}
