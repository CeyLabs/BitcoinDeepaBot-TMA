"use client";

import { Eye, EyeOff } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "cn";
import { haptic } from "@/platform";

interface VisibleToggleProps {
  visible: boolean;
  onToggle: () => void;
  dark?: boolean;
  className?: string;
}

export function VisibleToggle({ visible, onToggle, dark = false, className }: VisibleToggleProps) {
  const Icon = visible ? Eye : EyeOff;

  return (
    <IconButton
      aria-label="Hide balances"
      aria-pressed={!visible}
      onClick={() => {
        haptic.impact("medium");
        onToggle();
      }}
      className={cn(className)}
    >
      <Icon
        size={18}
        strokeWidth={1.75}
        className={dark ? "text-muted-foreground" : "text-[#111821] dark:text-[#f1f5f9]"}
      />
    </IconButton>
  );
}
