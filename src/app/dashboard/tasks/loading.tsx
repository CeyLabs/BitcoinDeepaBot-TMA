import { Fragment } from "react";
import { Bone, BoneCard } from "@/components/ui/bone";

// Route fallback while navigating here. Without it Next falls back to the
// wallet's loading.tsx. Mirrors the tasks list: title, filter pills, rows.
export default function TasksLoading() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Bone className="h-4 w-12" />
      <div className="flex h-9 gap-2">
        {["w-24", "w-16", "w-24"].map((w, i) => (
          <BoneCard key={i} className={`flex h-9 ${w} items-center justify-center rounded-[12px]`}>
            <Bone className="h-3 w-2/3" />
          </BoneCard>
        ))}
      </div>
      <div className="w-full overflow-hidden rounded-[12px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:bg-[#0B0F14]">
        {Array.from({ length: 2 }).map((_, i) => (
          <Fragment key={i}>
            {i > 0 && <div className="h-px bg-[#e2e8f0] dark:bg-[#334155]" />}
            <div className="flex h-20 items-center gap-2 px-3">
              <Bone className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Bone className="h-4 w-36" />
                <Bone className="h-3 w-48" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Bone className="h-5 w-16 rounded-[20px]" />
                <Bone className="h-3 w-14" />
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
