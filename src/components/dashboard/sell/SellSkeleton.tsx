import { Bone, BoneCard } from "@/components/ui/bone";

// Mirrors the sell page: header, start card, recent sales list.
export function SellSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex min-h-11 items-center justify-center">
        <Bone className="h-4 w-20" />
      </div>
      <BoneCard className="flex flex-col items-center gap-2 px-5 py-6">
        <Bone className="size-[72px] rounded-full" />
        <Bone className="h-6 w-40" />
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-2/3" />
        <Bone className="mt-2 h-[50px] w-full rounded-xl" />
      </BoneCard>
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-24" />
        <BoneCard className="flex flex-col">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex min-h-14 items-center gap-3 px-3.5 py-3">
              <Bone className="size-9 rounded-[10px]" />
              <div className="flex grow flex-col gap-1.5">
                <Bone className="h-4 w-24" />
                <Bone className="h-3 w-40" />
              </div>
              <Bone className="h-6 w-16 rounded-lg" />
            </div>
          ))}
        </BoneCard>
      </div>
    </div>
  );
}
