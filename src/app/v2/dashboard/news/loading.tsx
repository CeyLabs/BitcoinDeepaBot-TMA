import { NewsCardSkeleton } from "@/components/skeletons/NewsCardSkeleton";

export default function NewsV2Loading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <NewsCardSkeleton />
    </div>
  );
}
