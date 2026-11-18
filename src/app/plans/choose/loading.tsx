import { ChoosePlanSkeleton } from "@/components/skeletons/choose-plan";

export default function ChoosePlanLoading() {
  return (
    <div className="bg-background mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-5 pt-5 pb-4">
      <ChoosePlanSkeleton />
    </div>
  );
}
