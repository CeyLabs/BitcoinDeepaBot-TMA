"use client";

import { IconButton } from "@/components/ui/icon-button";
import { Funnel } from "lucide-react";
import { SearchField } from "@/components/ui/search-field";
import { VisibleToggle } from "@/components/ui/visible-toggle";

export interface ActivitySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
}

export function ActivitySearchBar({
  value,
  onChange,
  visible,
  onToggleVisible,
}: ActivitySearchBarProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <SearchField className="flex-1" value={value} onChange={(e) => onChange(e.target.value)} />
      <VisibleToggle visible={visible} onToggle={onToggleVisible} className="bg-card" />
      <IconButton className="bg-card">
        <Funnel size={18} strokeWidth={1.75} className="text-[#111821] dark:text-[#f1f5f9]" />
      </IconButton>
    </div>
  );
}
