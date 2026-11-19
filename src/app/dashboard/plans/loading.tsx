import { Bone, BoneCard } from "@/components/ui/bone";
import { HeroCard } from "@/components/skeletons/shared";

// Mirrors the plans page: plan hero, payment method row, gift plans card.
export default function PlansLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-28" />

        <HeroCard className="flex flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <Bone className="size-[52px] shrink-0 rounded-full" />
            <div className="flex grow flex-col gap-1.5">
              <Bone className="h-5 w-28" />
              <Bone className="h-3.5 w-20" />
            </div>
            <Bone className="h-6 w-16 rounded-lg" />
          </div>
          <Bone className="h-[68px] w-full rounded-xl" />
          <Bone className="h-[68px] w-full rounded-xl" />
          <div className="flex gap-2">
            <Bone className="h-11 flex-1 rounded-xl" />
            <Bone className="h-11 flex-1 rounded-xl" />
          </div>
        </HeroCard>

        <BoneCard className="flex h-16 items-center gap-3 px-4">
          <Bone className="size-9 rounded-full" />
          <div className="flex flex-col gap-2">
            <Bone className="h-4 w-28" />
            <Bone className="h-3 w-44" />
          </div>
        </BoneCard>
      </div>

      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-20" />
        <BoneCard className="flex h-[216px] flex-col items-center justify-center gap-2 rounded-2xl px-4">
          <Bone className="size-16 rounded-xl" />
          <Bone className="h-5 w-44" />
          <Bone className="h-3.5 w-60" />
          <Bone className="h-3.5 w-40" />
          <Bone className="h-6 w-24 rounded-lg" />
        </BoneCard>
      </div>
    </div>
  );
}
