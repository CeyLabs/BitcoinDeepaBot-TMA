import { ChoosePlanSkeleton } from "@/components/skeletons/choose-plan";

export default function ChoosePlanLoading() {
  return (
    <div className="bg-background mx-auto flex min-h-screen w-full max-w-[440px] flex-col gap-5 px-4 pt-3 pb-[calc(110px+env(safe-area-inset-bottom))]">
      <div className="min-h-11" />
      <ChoosePlanSkeleton />
    </div>
  );
}
