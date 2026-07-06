"use client";

import { Avatar } from "@telegram-apps/telegram-ui";
import { VisibleToggle } from "@/components/ui/visible-toggle";
import { useUser } from "@/hooks/useUser";
import { useStore } from "@/lib/store";

export function DashboardTopBar() {
  const { initials, displayName, photoUrl } = useUser();
  const { balanceVisible, toggleBalanceVisible } = useStore();

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar
          src={photoUrl}
          acronym={initials}
          size={40}
          className="shrink-0! bg-[#ffb14c]! text-white!"
        />
        <p className="truncate text-[14px] capitalize leading-5 text-[#64748b]">
          {displayName}
        </p>
      </div>
      <VisibleToggle
        visible={balanceVisible}
        onToggle={toggleBalanceVisible}
        className="bg-white! dark:bg-[#1b2027]!"
      />
    </div>
  );
}
