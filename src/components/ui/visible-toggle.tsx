"use client";

import { Eye, EyeOff } from "lucide-react";
import { IconButton } from "@telegram-apps/telegram-ui";
import { cn } from "@/lib/cn";

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
      mode={dark ? "plain" : "outline"}
      size="m"
      onClick={onToggle}
      className={cn(
        "w-9! h-9! rounded-[12px]!",
        dark
          ? "bg-transparent! hover:bg-white/5! active:bg-white/10!"
          : "bg-white! border-[#e2e8f0]! drop-shadow-[1px_1px_3px_rgba(203,213,225,0.3)]! hover:bg-[#f8fafc]! active:bg-[#f1f5f9]!",
        className
      )}
    >
      <Icon
        size={18}
        strokeWidth={1.75}
        className={dark ? "text-muted-foreground" : "text-[#111821]"}
      />
    </IconButton>
  );
}
