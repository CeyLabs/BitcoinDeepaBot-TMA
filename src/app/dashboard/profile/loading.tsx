import { Bone, BoneCard } from "@/components/ui/bone";

// Mirrors the profile page: avatar + name, then the section cards.
export default function ProfileLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <Bone className="size-18 rounded-full" />
        <Bone className="h-5 w-36" />
        <Bone className="h-3.5 w-28" />
      </div>
      {[64, 132, 200].map((h) => (
        <div key={h} className="flex flex-col gap-2">
          <Bone className="h-3.5 w-24" />
          <BoneCard className="w-full">
            <div style={{ height: h }} />
          </BoneCard>
        </div>
      ))}
    </div>
  );
}
