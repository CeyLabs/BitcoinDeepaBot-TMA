"use client";

/* eslint-disable @next/next/no-img-element -- inline SVG data URIs; next/image adds nothing */

import { useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAvatarSeed, useSetAvatar } from "@/hooks/query/useUserMe";
import { avatarUri, randomSeed } from "@/lib/avatar";
import { haptic } from "@/platform";

// Three full rows of four; the current picture takes the first tile.
const CHOICES = 12;
const fresh = () => Array.from({ length: CHOICES }, randomSeed);

/** Pick a new profile picture: the current sprout plus random ones; shuffle for more. */
export function AvatarPickerSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const toast = useToast();
  const current = useAvatarSeed();
  const save = useSetAvatar();
  const [seeds, setSeeds] = useState(fresh);
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = picked ?? current;
  const tiles = [current, ...seeds].filter((s): s is string => !!s).slice(0, CHOICES);

  const confirm = () => {
    if (!picked || picked === current) return onOpenChange(false);
    save.mutate(picked, {
      onSuccess: () => {
        haptic.notify("success");
        toast({ title: "Profile picture updated" });
        setPicked(null);
        onOpenChange(false);
      },
      onError: (e) => {
        haptic.notify("error");
        toast({ type: "error", title: "Couldn't save", description: e.message });
      },
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next && save.isPending) return;
        if (!next) setPicked(null);
        onOpenChange(next);
      }}
      title="Profile picture"
      hideClose={save.isPending}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              haptic.select();
              setSeeds(fresh());
            }}
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
            Show me more
          </Button>
          <Button
            loading={save.isPending}
            disabled={!picked || picked === current}
            onClick={confirm}
          >
            Use this picture
          </Button>
        </div>
      }
    >
      <div className="px-4">
        <div className="flex justify-center py-2">
          <UserAvatar key={chosen ?? "none"} seed={chosen} size={96} className="animate-pop" />
        </div>
        <p className="text-ink3 mx-0.5 mt-2 mb-3 text-center text-[13px] leading-normal">
          Pick a sprout. Tap Show me more for new ones.
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {tiles.map((s, i) => (
            // A square <div> owns the shape and the clip: Safari ignores
            // aspect-ratio on a <button>.
            <button
              key={`${s}-${i}`}
              type="button"
              aria-label={s === current ? "Current picture" : `Picture ${i + 1}`}
              aria-pressed={s === chosen}
              onClick={() => {
                haptic.select();
                setPicked(s);
              }}
              className={cn(
                "press block w-full rounded-full border-2 bg-transparent p-0.5",
                s === chosen ? "border-primary" : "border-transparent"
              )}
            >
              <div
                className="bg-avatar relative w-full overflow-hidden rounded-full"
                style={{ aspectRatio: "1 / 1" }}
              >
                <img
                  src={avatarUri(s) ?? undefined}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
