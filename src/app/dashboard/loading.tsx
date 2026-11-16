import { Bone, BoneCard } from "@/components/ui/bone";
import { HeroCard } from "@/components/skeletons/shared";

// Mirrors the wallet page layout (sizes measured from the loaded page) so
// nothing jumps when the data arrives.
export default function WalletLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      {/* Top bar: avatar + name, action buttons */}
      <div className="flex h-10 w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Bone className="size-10 shrink-0 rounded-full" />
          <Bone className="h-3.5 w-24" />
        </div>
        <div className="flex gap-2">
          <BoneCard className="size-[34px] rounded-[12px]" />
          <BoneCard className="size-[34px] rounded-[12px]" />
        </div>
      </div>

      {/* Total value card */}
      <HeroCard className="flex h-40 flex-col gap-3">
        <Bone className="h-3 w-20" />
        <Bone className="h-9 w-44 rounded-lg" />
        <Bone className="h-3 w-36" />
        <Bone className="h-6 w-40 rounded-[8px]" />
      </HeroCard>

      {/* My Plan: plan row + two date cards */}
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-16" />
        <div className="flex flex-col gap-2">
          <BoneCard className="flex h-[60px] items-center gap-3 rounded-xl px-4">
            <Bone className="size-9 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Bone className="h-4 w-28" />
              <Bone className="h-3 w-20" />
            </div>
            <Bone className="h-5 w-14 rounded-full" />
          </BoneCard>
          <div className="flex gap-2">
            {[0, 1].map((i) => (
              <BoneCard key={i} className="flex h-[84px] flex-1 flex-col gap-2 rounded-[12px] p-3">
                <Bone className="h-3.5 w-20" />
                <div className="flex items-center gap-2">
                  <Bone className="size-9 shrink-0 rounded-lg" />
                  <div className="flex flex-col gap-1.5">
                    <Bone className="h-4 w-20" />
                    <Bone className="h-3 w-14" />
                  </div>
                </div>
              </BoneCard>
            ))}
          </div>
        </div>
      </div>

      {/* Performance: 2x2 grid */}
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <BoneCard key={i} className="flex h-[136px] flex-col gap-2.5 p-3">
              <Bone className="size-9 rounded-lg" />
              <Bone className="h-3.5 w-20" />
              <Bone className="h-4 w-24" />
              <Bone className="h-3 w-28" />
            </BoneCard>
          ))}
        </div>
      </div>

      {/* Reward portfolio chart */}
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-48" />
        <BoneCard className="flex h-[276px] flex-col gap-3 rounded-[12px] p-3">
          <Bone className="w-full flex-1 rounded-lg" />
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Bone key={i} className="h-3.5 w-14" />
            ))}
          </div>
        </BoneCard>
      </div>
    </div>
  );
}
