"use client";

import { Bone } from "@/components/ui/bone";
import { Progress } from "@/components/ui/progress";
import { useUserCount } from "@/hooks/query/useUserCount";

const tierMaxCounts = [100, 200, 500, 1000, 2500, 5000, 10000];

function getCurrentTierMax(n: number): number {
  for (const max of tierMaxCounts) {
    if (n <= max) return max;
  }
  return 10000;
}

/** Community members joined, against the current milestone (flame bar). */
export function UserProgress() {
  const { count, isLoading } = useUserCount();

  const currentTierMax = getCurrentTierMax(count);
  const progressPct = Math.min((count / currentTierMax) * 100, 100);

  // Avoid flashing "0 Joined" / "/100" before the count has loaded.
  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-2">
        <Progress value={0} label="Members joined" />
        <div className="flex w-full items-baseline justify-between">
          <Bone className="h-7 w-28" />
          <Bone className="h-4 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Progress value={progressPct} label="Members joined" />
      <div className="flex w-full items-baseline justify-between">
        <p className="flex items-baseline gap-1.5">
          <span className="num text-[22px] font-bold">{count.toLocaleString()}</span>
          <span className="text-ink3 text-[14px] font-semibold">Joined</span>
        </p>
        <p className="num text-ink3 text-[14px] font-semibold">
          /{currentTierMax.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
