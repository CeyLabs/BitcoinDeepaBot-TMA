import { Bone, BoneCard } from "@/components/ui/bone";
import { HeroCard } from "@/components/skeletons/shared";

// Mirrors the wallet layout so nothing jumps when the data arrives.
export default function WalletLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      {/* Total value */}
      <HeroCard className="flex h-[164px] flex-col gap-2">
        <Bone className="h-3.5 w-20" />
        <Bone className="mt-1 h-10 w-[200px] rounded-lg" />
        <Bone className="h-3.5 w-[150px]" />
        <Bone className="h-6 w-[180px] rounded-lg" />
      </HeroCard>

      {/* Quick actions */}
      <div className="-mt-2 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <BoneCard key={i} className="h-[55px]" />
        ))}
      </div>

      {/* My plan */}
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-16" />
        <BoneCard className="flex h-16 items-center gap-3 px-4">
          <Bone className="size-9 rounded-full" />
          <div className="flex flex-col gap-2">
            <Bone className="h-4 w-24" />
            <Bone className="h-3 w-32" />
          </div>
        </BoneCard>
        <div className="grid grid-cols-2 gap-2">
          <BoneCard className="h-[86px]" />
          <BoneCard className="h-[86px]" />
        </div>
      </div>

      {/* News */}
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-12" />
        <Bone className="h-[180px] w-full rounded-xl" />
      </div>

      {/* Performance */}
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <BoneCard key={i} className="flex h-[124px] flex-col gap-2 p-3">
              <Bone className="size-9 rounded-full" />
              <Bone className="h-3.5 w-20" />
              <Bone className="h-4 w-24" />
            </BoneCard>
          ))}
        </div>
      </div>
    </div>
  );
}
