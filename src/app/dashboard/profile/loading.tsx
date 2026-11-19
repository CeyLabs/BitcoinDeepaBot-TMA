import { Bone } from "@/components/ui/bone";

// Mirrors the profile page: header, profile row, appearance toggle, then the lists.
export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex min-h-11 items-center justify-center">
        <Bone className="h-4 w-36" />
      </div>
      <div className="bg-chip flex items-center gap-3.5 rounded-xl p-3.5">
        <Bone className="size-14 rounded-full" />
        <div className="flex flex-col gap-2">
          <Bone className="h-4.5 w-32" />
          <Bone className="h-3.5 w-24" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Bone className="h-3.5 w-24" />
        <Bone className="h-12 w-full rounded-full" />
      </div>
      {[3, 1, 4].map((rows, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Bone className="h-3.5 w-24" />
          <div className="bg-chip rounded-xl">
            {Array.from({ length: rows }, (_, r) => (
              <div key={r} className="flex min-h-14 items-center gap-3 px-3.5 py-3">
                <Bone className="size-9 rounded-[10px]" />
                <div className="flex flex-col gap-2">
                  <Bone className="h-3.5 w-28" />
                  <Bone className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
