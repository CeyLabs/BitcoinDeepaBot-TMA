import { Bone, BoneCard } from "@/components/ui/bone";
import { HeroCard } from "@/components/skeletons/shared";

// Mirrors the plans page layout (sizes measured from the loaded page).
export default function PlansLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full flex-col gap-3">
        <div className="flex h-[34px] items-center justify-between">
          <Bone className="h-4 w-28" />
          <BoneCard className="size-[34px] rounded-[12px]" />
        </div>

        {/* Plan hero: icon + name/price/badge, Manage Plan pill, dates, invested box */}
        <HeroCard className="flex h-[270px] flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Bone className="size-15 shrink-0 rounded-full" />
              <div className="flex flex-col gap-2">
                <Bone className="h-5 w-28" />
                <Bone className="h-3.5 w-20" />
                <Bone className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <Bone className="h-9 w-28 rounded-full" />
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-1.5">
              <Bone className="h-3 w-24" />
              <Bone className="h-3.5 w-20" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Bone className="h-3 w-20" />
              <Bone className="h-3.5 w-20" />
            </div>
          </div>
          <div className="flex flex-1 justify-between rounded-[12px] bg-white/30 p-3 dark:bg-white/5">
            <div className="flex flex-col gap-1.5">
              <Bone className="h-3 w-20" />
              <Bone className="h-4 w-24" />
              <Bone className="h-3 w-28" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Bone className="h-3 w-20" />
              <Bone className="h-4 w-24" />
              <Bone className="h-4 w-20 rounded-lg" />
            </div>
          </div>
        </HeroCard>
      </div>

      {/* Gift Plans: coming-soon card */}
      <div className="flex w-full flex-col gap-3">
        <Bone className="h-4 w-20" />
        <BoneCard className="flex h-[236px] flex-col items-center justify-center gap-3 rounded-xl px-6">
          <Bone className="size-14 rounded-xl" />
          <Bone className="h-4 w-44" />
          <div className="flex w-full flex-col items-center gap-1.5">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-2/3" />
          </div>
          <Bone className="h-7 w-28 rounded-full" />
        </BoneCard>
      </div>
    </div>
  );
}
