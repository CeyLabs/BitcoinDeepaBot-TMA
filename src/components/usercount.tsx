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
            setCount((data.count as number) || 80);
        }
        fetchUserCount();
    }, [setCount]);

    // Array to maintain tier maximum counts
    const tierMaxCounts = [100, 200, 500, 1000, 2500, 5000, 10000];

    // Function to calculate progress based on the entire range (0 to 100%)
    const getProgressValue = (count: number): number => {
        // Calculate the progress percentage based on the current range
        const progress = (count / getCurrentTierMax(count)) * 100;
        return Math.min(progress, 100); // Ensure it doesn't exceed 100%
    };

    // Function to determine the current tier's max count for display
    const getCurrentTierMax = (count: number): number => {
        for (const maxCount of tierMaxCounts) {
            if (count <= maxCount) return maxCount;
        }
        return 10000; // Fallback for very large counts
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
                    <span className="pl-1 text-sm font-normal text-tma-text-secondary">Joined</span>
                </p>
                <p className="text-tma-text-secondary">{currentTierMax}</p>
            </div>
        </div>
    );
}
