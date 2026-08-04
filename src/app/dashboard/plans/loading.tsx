export default function PlansLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-28 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
          <div className="size-8 animate-pulse rounded-full bg-[#e2e8f0] dark:bg-[#1e293b]" />
        </div>
        <div className="h-40 w-full animate-pulse rounded-[20px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
      </div>

      <div className="flex w-full flex-col gap-3">
        <div className="h-3.5 w-20 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-8 dark:bg-[#0B0F14]">
          <div className="size-14 animate-pulse rounded-full bg-[#e2e8f0] dark:bg-[#1e293b]" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-40 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
            <div className="h-3 w-56 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
          </div>
          <div className="h-6 w-28 animate-pulse rounded-full bg-[#e2e8f0] dark:bg-[#1e293b]" />
        </div>
      </div>
    </div>
  );
}
