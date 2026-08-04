function SkeletonRow() {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      <div className="size-9 shrink-0 animate-pulse rounded-full bg-[#e2e8f0] dark:bg-[#1e293b]" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-3.5 w-24 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="h-3 w-32 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="h-3.5 w-16 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="h-3 w-20 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
      </div>
    </div>
  );
}

function SkeletonGroup({ rows }: { rows: number }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="h-3.5 w-20 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />

      <div className="w-full overflow-hidden rounded-[12px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:bg-[#0B0F14]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            {i > 0 && <div className="h-px bg-[#e2e8f0] dark:bg-[#334155]" />}
            <SkeletonRow />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="flex w-full flex-col gap-5">
      <SkeletonGroup rows={3} />
      <SkeletonGroup rows={2} />
    </div>
  );
}
