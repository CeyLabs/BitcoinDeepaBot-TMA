"use client";

import { VisibleToggle } from "@/components/ui/visible-toggle";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";

export function DashboardTopBar() {
  const { initials, displayName } = useUser();
  const { balanceVisible, toggleBalanceVisible } = useStore();

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-1">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ffb14c]">
          <span className="text-[16px] font-extrabold text-white">{initials}</span>
        </div>
        <p className="truncate text-[14px] capitalize leading-[14px] text-[#64748b]">
          {displayName}
        </p>
      </div>
      <VisibleToggle visible={balanceVisible} onToggle={toggleBalanceVisible} />
    </div>
  );
}
