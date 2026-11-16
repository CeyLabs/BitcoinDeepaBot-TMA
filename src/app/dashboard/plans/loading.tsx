import { Bone } from "@/components/ui/bone";

// Mirrors the plans page layout (sizes measured from the loaded page).
export default function PlansLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full flex-col gap-3">
        <div className="flex h-[34px] items-center justify-between">
          <Bone className="h-4 w-28" />
          <Bone className="size-[34px] rounded-[12px]" />
        </div>
        <Bone className="h-[270px] w-full rounded-[20px]" />
      </div>

      <div className="flex w-full flex-col gap-3">
        <Bone className="h-4 w-20" />
        <Bone className="h-[236px] w-full rounded-[12px]" />
      </div>
    </div>
  );
}
