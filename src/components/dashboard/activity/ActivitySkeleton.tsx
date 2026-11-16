import { Bone, BoneCard } from "@/components/ui/bone";

function SkeletonRow() {
  return (
    <div className="my-0.5 flex h-[62px] items-center gap-2 px-3">
      <Bone className="size-10 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Bone className="h-3.5 w-24" />
        <Bone className="h-3 w-32" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <Bone className="h-3.5 w-16" />
        <Bone className="h-3 w-20" />
      </div>
    </div>
  );
}

function SkeletonGroup({ rows }: { rows: number }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <Bone className="h-3.5 w-20" />

      <BoneCard className="w-full overflow-hidden rounded-[12px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            {i > 0 && <div className="h-px bg-[#e2e8f0] dark:bg-[#334155]" />}
            <SkeletonRow />
          </div>
        ))}
      </BoneCard>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="flex w-full flex-col gap-5">
      <SkeletonGroup rows={3} />
      <SkeletonGroup rows={2} />
    </div>
  );
}
