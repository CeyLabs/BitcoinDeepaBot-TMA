import { Bone, BoneCard } from "@/components/ui/bone";

export default function NewsArticleLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <BoneCard className="size-10 rounded-full" />

      <Bone className="h-48 w-full rounded-[16px]" />

      <div className="flex flex-col gap-2">
        <Bone className="h-7 w-full" />
        <Bone className="h-7 w-2/3" />
        <Bone className="h-4 w-1/2" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className={i % 3 === 2 ? "h-4 w-3/5" : "h-4 w-full"} />
        ))}
      </div>
    </div>
  );
}
