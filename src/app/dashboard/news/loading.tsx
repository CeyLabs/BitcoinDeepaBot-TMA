import { Bone, BoneCard } from "@/components/ui/bone";

// Mirrors the news page: header, featured card, category chips, article cards.
export default function NewsLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex min-h-11 items-center justify-center">
        <Bone className="h-4 w-12" />
      </div>

      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-16" />
        <div className="bg-primary/80 flex min-h-[150px] flex-col gap-2 rounded-[20px] py-[18px] pr-[124px] pl-[18px] [--bone:rgba(255,255,255,0.35)]">
          <Bone className="h-6 w-32 rounded-lg" />
          <Bone className="h-5 w-full" />
          <Bone className="h-5 w-3/4" />
          <Bone className="h-3.5 w-full" />
        </div>
      </div>

      <div className="flex gap-2">
        {["w-10", "w-20", "w-20", "w-16"].map((w, i) => (
          <BoneCard key={i} className={`flex h-9 ${w} items-center justify-center rounded-xl`}>
            <Bone className="h-3 w-2/3" />
          </BoneCard>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Bone className="h-4 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <BoneCard key={i} className="shadow-card flex items-start gap-3 p-3">
            <Bone className="size-20 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-1/2" />
            </div>
          </BoneCard>
        ))}
      </div>
    </div>
  );
}
