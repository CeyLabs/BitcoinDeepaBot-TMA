import { Bone } from "@/components/ui/bone";
import { ActivitySkeleton } from "@/components/dashboard/activity/ActivitySkeleton";

export default function ActivityLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      {/* Search + eye + filter buttons */}
      <div className="flex h-9 w-full items-center gap-2">
        <Bone className="h-9 flex-1 rounded-2xl" />
        <Bone className="size-[34px] shrink-0 rounded-[12px]" />
        <Bone className="size-[34px] shrink-0 rounded-[12px]" />
      </div>

      {/* Filter pills */}
      <div className="flex h-9 gap-2">
        <Bone className="h-9 w-28 rounded-[12px]" />
        <Bone className="h-9 w-28 rounded-[12px]" />
        <Bone className="h-9 w-16 rounded-[12px]" />
      </div>

      <ActivitySkeleton />
    </div>
  );
}
