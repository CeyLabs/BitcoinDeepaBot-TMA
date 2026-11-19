import { Bone, BoneCard } from "@/components/ui/bone";
import { PLAN_CTA_BAR } from "@/components/dashboard/plans/plan-cta-bar";

// Mirrors the plan picker (back row, title, weekly/monthly toggle, plan cards,
// bottom bar) so the page fills in place instead of flashing a spinner.
export function ChoosePlanSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center gap-1.5">
        <Bone className="h-7 w-48" />
        <Bone className="h-3 w-64" />
        <Bone className="h-3 w-40" />
      </div>
      <div className="bg-chip flex h-12 gap-1 rounded-full p-1">
        <BoneCard className="flex flex-1 items-center justify-center rounded-full">
          <Bone className="h-3.5 w-16" />
        </BoneCard>
        <div className="flex flex-1 items-center justify-center">
          <Bone className="h-3.5 w-16" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <BoneCard key={i} className="flex h-[76px] items-center gap-2.5 px-4">
            <Bone className="size-5 shrink-0 rounded-full" />
            <Bone className="size-10 shrink-0 rounded-full" />
            <Bone className="h-4 w-20" />
            <Bone className="ml-auto h-4 w-24" />
          </BoneCard>
        ))}
      </div>
      <div aria-hidden className="h-[62px] shrink-0" />
      <div className={PLAN_CTA_BAR}>
        <Bone className="h-[50px] w-full rounded-xl" />
      </div>
    </>
  );
}
