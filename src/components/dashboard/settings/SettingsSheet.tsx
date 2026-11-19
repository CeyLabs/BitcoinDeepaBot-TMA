"use client";

import { Sheet } from "@/components/ui/sheet";
import { SettingsContent } from "./SettingsContent";

/** Profile & settings, opened from the header avatar. */
export default function SettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Profile & settings">
      <SettingsContent className="px-4 pt-1 pb-6" onNavigate={() => onOpenChange(false)} />
    </Sheet>
  );
}
