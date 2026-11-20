import { Bone, BoneCard } from "@/components/ui/bone";
import { ActivitySkeleton } from "@/components/dashboard/activity/ActivitySkeleton";

export default function ActivityLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      {/* Search + round eye button */}
      <div className="flex w-full items-center gap-2">
        <BoneCard className="shadow-card flex h-11 flex-1 items-center gap-2 px-3">
          <Bone className="size-5 rounded-full" />
          <Bone className="h-3.5 w-16" />
        </BoneCard>
        <BoneCard className="shadow-card size-11 shrink-0 rounded-full" />
      </div>

      {/* Filter chips */}
      <div className="-mt-2 flex gap-2">
        {["w-10", "w-24", "w-14", "w-14"].map((w, i) => (
          <BoneCard key={i} className={`flex h-9 ${w} items-center justify-center rounded-xl`}>
            <Bone className="h-3 w-2/3" />
          </BoneCard>
        ))}
      </div>

      <ActivitySkeleton />
    </div>
  );
}
