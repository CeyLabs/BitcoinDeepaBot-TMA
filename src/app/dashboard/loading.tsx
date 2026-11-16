import { Bone } from "@/components/ui/bone";

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
          <Bone className="size-[34px] rounded-[12px]" />
          <Bone className="size-[34px] rounded-[12px]" />
        </div>
      </div>

      {/* Total value card */}
      <Bone className="h-40 w-full rounded-[20px]" />

      {/* My Plan: plan row + two date cards */}
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-16" />
        <div className="flex flex-col gap-2">
          <Bone className="h-[60px] w-full rounded-xl" />
          <div className="flex gap-2">
            <Bone className="h-[84px] flex-1 rounded-[12px]" />
            <Bone className="h-[84px] flex-1 rounded-[12px]" />
          </div>
        </div>
      </div>

      {/* Performance: 2x2 grid */}
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-[136px] rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Reward portfolio chart */}
      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-48" />
        <Bone className="h-[276px] w-full rounded-[12px]" />
      </div>
    </div>
  );
}
