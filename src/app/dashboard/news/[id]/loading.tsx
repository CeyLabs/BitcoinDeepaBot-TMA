export default function NewsArticleLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="h-9 w-24 animate-pulse rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />

      <div className="h-48 w-full animate-pulse rounded-[16px] bg-[#e2e8f0] dark:bg-[#1e293b]" />

      <div className="flex flex-col gap-2">
        <div className="h-7 w-full animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="h-7 w-2/3 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]"
            style={{ width: i % 3 === 2 ? "60%" : "100%" }}
          />
        ))}
      </div>
    </div>
  );
}
