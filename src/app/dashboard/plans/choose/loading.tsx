import { ChoosePlanSkeleton } from "@/components/skeletons/choose-plan";

export default function ChoosePlanLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="min-h-11" />
      <ChoosePlanSkeleton />
    </div>
  );
}
