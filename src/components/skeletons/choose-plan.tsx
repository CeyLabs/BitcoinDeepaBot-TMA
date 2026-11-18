import { Bone, BoneCard } from "@/components/ui/bone";

// Mirrors the plan picker (title, label, weekly/monthly toggle, plan cards,
// button) so the page fills in place instead of flashing a spinner.
export function ChoosePlanSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center gap-1.5">
        <Bone className="h-6 w-48" />
        <Bone className="h-3 w-40" />
      </div>
      <Bone className="h-4 w-24" />
      {/* Weekly / Monthly toggle */}
      <div className="flex h-10 gap-1 rounded-full bg-[#f1f5f9] p-1 dark:bg-[#242b35]">
        <BoneCard className="flex flex-1 items-center justify-center rounded-full">
          <Bone className="h-3.5 w-16" />
        </BoneCard>
        <div className="flex flex-1 items-center justify-center">
          <Bone className="h-3.5 w-16" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <BoneCard key={i} className="flex h-[58px] items-center gap-2 rounded-[12px] px-4">
            <Bone className="size-5 shrink-0 rounded-full" />
            <Bone className="size-[22px] shrink-0 rounded-md" />
            <Bone className="h-4 w-20" />
            <Bone className="ml-auto h-5 w-24" />
          </BoneCard>
        ))}
      </div>
      <Bone className="h-[50px] w-full rounded-[12px]" />
    </>
  );
}
