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
    <IconButton mode="gray" size="m" onClick={onToggle} className={cn(className)}>
      <Icon
        size={18}
        strokeWidth={1.75}
        className={dark ? "text-muted-foreground" : "text-[#111821] dark:text-[#f1f5f9]"}
      />
    </IconButton>
  );
}
