import { Bone, BoneCard } from "@/components/ui/bone";
import { ActivitySkeleton } from "@/components/dashboard/activity/ActivitySkeleton";

export default function ActivityLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      {/* Search + eye + filter buttons */}
      <div className="flex h-9 w-full items-center gap-2">
        <BoneCard className="flex h-9 flex-1 items-center gap-2 px-3">
          <Bone className="size-4 rounded-full" />
          <Bone className="h-3 w-16" />
        </BoneCard>
        <BoneCard className="size-[34px] shrink-0 rounded-[12px]" />
        <BoneCard className="size-[34px] shrink-0 rounded-[12px]" />
      </div>

      {/* Filter pills */}
      <div className="flex h-9 gap-2">
        {["w-28", "w-28", "w-16"].map((w, i) => (
          <BoneCard key={i} className={`flex h-9 ${w} items-center justify-center rounded-[12px]`}>
            <Bone className="h-3 w-2/3" />
          </BoneCard>
        ))}
      </div>

      <ActivitySkeleton />
    </div>
  );
}
