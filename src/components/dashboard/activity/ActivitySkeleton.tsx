import { Bone, BoneCard } from "@/components/ui/bone";

function SkeletonRow() {
  return (
    <div className="flex h-[60px] items-center gap-3 pr-1.5 pl-3">
      <Bone className="size-9 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Bone className="h-3.5 w-28" />
        <Bone className="h-3 w-36" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <Bone className="h-3.5 w-16" />
        <Bone className="h-3 w-20" />
      </div>
      <Bone className="size-4 shrink-0 rounded" />
    </div>
  );
}

function SkeletonGroup({ rows }: { rows: number }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <Bone className="h-4 w-20" />
      <BoneCard className="shadow-card p-1">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </BoneCard>
    </div>
  );
}

/** Day groups placeholder, shared by the route loading state and the page. */
export function ActivitySkeleton() {
  return (
    <div className="flex w-full flex-col gap-5">
      <SkeletonGroup rows={3} />
      <SkeletonGroup rows={2} />
    </div>
  );
}
