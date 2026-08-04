import { ActivitySkeleton } from "@/components/dashboard/activity/ActivitySkeleton";

export default function ActivityLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-[#e2e8f0] dark:bg-[#1e293b]" />
      </div>

      <div className="flex gap-2">
        <div className="h-9 w-16 animate-pulse rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="h-9 w-20 animate-pulse rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
        <div className="h-9 w-20 animate-pulse rounded-[12px] bg-[#e2e8f0] dark:bg-[#1e293b]" />
      </div>

      <ActivitySkeleton />
    </div>
  );
}
