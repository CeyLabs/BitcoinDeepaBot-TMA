import { Bone, BoneCard } from "@/components/ui/bone";

// Route fallback while navigating here. Without it Next falls back to the
// wallet's loading.tsx. Mirrors the tasks tab: title, hero, invite pill,
// filter, task rows.
export default function TasksLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <Bone className="mx-auto h-7 w-20" />
      <div className="flex h-[226px] flex-col gap-2 rounded-xl bg-[#3b7df5] px-4 py-3 [--bone:rgb(255_255_255/0.28)]">
        <Bone className="h-6 w-48" />
        <Bone className="h-3.5 w-52" />
        <div className="flex gap-2">
          <Bone className="h-[50px] flex-1 rounded-xl" />
          <Bone className="h-[50px] flex-1 rounded-xl" />
        </div>
        <Bone className="w-full flex-1 rounded-xl" />
      </div>
      <Bone className="h-[90px] w-full rounded-full" />
      <Bone className="h-12 w-full rounded-full" />
      <BoneCard className="py-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex h-[76px] items-center gap-3 px-3">
            <Bone className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Bone className="h-4 w-36" />
              <Bone className="h-3 w-44" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Bone className="h-[22px] w-16 rounded-lg" />
              <Bone className="h-9 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </BoneCard>
    </div>
  );
}
