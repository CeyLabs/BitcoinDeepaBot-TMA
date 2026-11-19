import { Bone } from "@/components/ui/bone";

// Mirrors the article page: header, orange cover, badge + meta, title, body.
export default function NewsArticleLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex min-h-11 items-center justify-center">
        <Bone className="h-4 w-12" />
      </div>

      <Bone className="h-[170px] w-full rounded-xl" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Bone className="h-6 w-20 rounded-lg" />
          <Bone className="h-3.5 w-32" />
        </div>
        <Bone className="h-7 w-full" />
        <Bone className="h-7 w-2/3" />
        <div className="mt-1 flex flex-col gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bone key={i} className={i % 3 === 2 ? "h-4 w-3/5" : "h-4 w-full"} />
          ))}
        </div>
      </div>
    </div>
  );
}
