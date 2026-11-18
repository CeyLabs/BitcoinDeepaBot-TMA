import { Bone, BoneCard } from "@/components/ui/bone";
import { HeroCard } from "@/components/skeletons/shared";

// Mirrors the news page: compact featured card, category pills, article cards.
export default function NewsLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <HeroCard className="flex h-72 flex-col gap-2">
        <Bone className="h-[121px] w-full rounded-[12px]" />
        <Bone className="mt-1 h-5 w-full" />
        <Bone className="h-5 w-3/4" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-1/3" />
      </HeroCard>
      <div className="flex gap-2">
        {["w-12", "w-20", "w-20"].map((w, i) => (
          <BoneCard key={i} className={`flex h-9 ${w} items-center justify-center rounded-[12px]`}>
            <Bone className="h-3 w-2/3" />
          </BoneCard>
        ))}
      </div>
      <div className="flex w-full flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <BoneCard key={i} className="flex items-start gap-3 rounded-[16px] p-3">
            <Bone className="size-20 shrink-0 rounded-[12px]" />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-1/2" />
            </div>
          </BoneCard>
        ))}
      </div>
    </div>
  );
}
