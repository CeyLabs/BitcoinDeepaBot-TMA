"use client";

import { IconButton } from "@telegram-apps/telegram-ui";
import { Funnel } from "lucide-react";
import { SearchField } from "@/components/ui/search-field";
import { VisibleToggle } from "@/components/ui/visible-toggle";
import { cn } from "@/lib/cn";

export interface ActivitySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  disabled?: boolean;
}

export function ActivitySearchBar({
  value,
  onChange,
  visible,
  onToggleVisible,
  disabled = false,
}: ActivitySearchBarProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <SearchField
        className={cn("flex-1", disabled && "opacity-50 cursor-not-allowed")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <IconButton
        mode="gray"
        size="m"
        disabled={disabled}
        className={cn(
          "bg-white! dark:bg-[#0B0F14]!",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Funnel size={18} strokeWidth={1.75} className="text-[#111821] dark:text-[#f1f5f9]" />
      </IconButton>
      <VisibleToggle
        visible={visible}
        onToggle={onToggleVisible}
        className="bg-white! dark:bg-[#0B0F14]!"
      />
    </div>
  );
}
