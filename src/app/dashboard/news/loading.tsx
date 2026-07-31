export default function NewsLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="h-56 w-full animate-pulse rounded-[20px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
      <div className="flex gap-2">
        <div className="h-9 w-16 animate-pulse rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="h-9 w-20 animate-pulse rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="h-9 w-20 animate-pulse rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
      </div>
      <div className="flex w-full flex-col gap-3 overflow-hidden rounded-[12px] bg-white p-3 dark:bg-[#0B0F14]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="size-16 shrink-0 animate-pulse rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
              <div className="h-3 w-full animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
