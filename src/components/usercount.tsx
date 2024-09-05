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

    // Array to maintain tier maximum counts
    const tierMaxCounts = [0, 200, 500, 1000, 2500, 5000, 10000];

    // Function to determine progress value dynamically based on tiers
    const getProgressValue = (count: number): number => {
        const totalProgress = 100; // Total percentage progress (100%)
        const tierCount = tierMaxCounts.length - 1; // Number of tiers

        for (let i = 1; i <= tierCount; i++) {
            const maxCount = tierMaxCounts[i];
            const prevMax = tierMaxCounts[i - 1];
            const tierRange = maxCount - prevMax;

            if (count <= maxCount) {
                // Calculate the percentage for this tier
                const progressPerTier = totalProgress / tierCount;
                const tierProgress = ((count - prevMax) / tierRange) * progressPerTier;
                return (i - 1) * progressPerTier + tierProgress;
            }
        }

        return 100; // If above the maximum tier
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
                    <span className="pl-1 text-sm font-normal text-gray-400">Joined</span>
                </p>
                <p className="text-gray-400">{currentTierMax}</p>
            </div>
        </div>
    );
}
