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
            setCount((data.count as number) || 80);
        }
        fetchUserCount();
    }, []);

    // Function to determine tier and progress value
    const getProgressValue = (count: number): number => {
        if (count <= 200) {
            return (count / 200) * 100; // 0-200 range
        } else if (count <= 500) {
            return (40 + (((count - 200) / (500 - 200)) * 100)); // 200-500 range
        } else if (count <= 1000) {
            return (50 + ((count - 500) / (1000 - 500)) * 100); // 500-1000 range
        } else if (count <= 2500) {
            return (40 + ((count - 1000) / (2500 - 1000)) * 100); // 1000-2500 range
        } else if (count <= 10000) {
            return (25 + ((count - 2500) / (10000 - 2500)) * 100); // 2500-10000 range
        } else {
            return 100; // Anything above 10000 is considered full progress
        }
    };

    // Determine the current tier's maximum count for display
    const getCurrentTierMax = (count: number): number => {
        if (count <= 200) return 200;
        if (count <= 500) return 500;
        if (count <= 1000) return 1000;
        if (count <= 2500) return 2500;
        return 10000;
    };

    // Calculate progress value for the current count
    const progressValue = getProgressValue(count);
    const currentTierMax = getCurrentTierMax(count);

    return (
        <div className="w-full px-3 pt-10 text-5xl font-semibold tabular-nums tracking-tight">
            <Progress
                value={progressValue}
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
                <p className="text-gray-400">{currentTierMax}</p>
            </div>
        </div>
    );
}