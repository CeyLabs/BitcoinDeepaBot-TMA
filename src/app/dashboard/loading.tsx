export default function WalletLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-[#e2e8f0] dark:bg-[#1e293b]" />
          <div className="h-3.5 w-24 animate-pulse rounded bg-[#e2e8f0] dark:bg-[#1e293b]" />
        </div>
        <div className="size-8 animate-pulse rounded-full bg-[#e2e8f0] dark:bg-[#1e293b]" />
      </div>

      <div className="h-40 w-full animate-pulse rounded-[20px] bg-[#e2e8f0] dark:bg-[#1e293b]" />

      <div className="h-24 w-full animate-pulse rounded-[20px] bg-[#e2e8f0] dark:bg-[#1e293b]" />

      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-[20px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="h-24 animate-pulse rounded-[20px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
      </div>

      <div className="h-48 w-full animate-pulse rounded-[20px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
    </div>
  );
}
