import { Bone, BoneCard } from "@/components/ui/bone";

// Mirrors the sell page: title, amount card, payout account, button.
export function SellSkeleton({ bare = false }: { bare?: boolean }) {
  return (
    <div className="flex w-full flex-col gap-5">
      {!bare && (
        <div className="flex flex-col items-center gap-1.5">
          <Bone className="h-6 w-32" />
          <Bone className="h-3 w-44" />
        </div>
      )}
      <BoneCard className="flex h-[210px] flex-col gap-4 p-5">
        <Bone className="h-3.5 w-full" />
        <Bone className="h-12 w-full rounded-[14px]" />
        <Bone className="h-4 w-2/3" />
      </BoneCard>
      <BoneCard className="h-[68px]" />
      <Bone className="h-[50px] w-full rounded-[12px]" />
    </div>
  );
}
