"use client";

import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";

export function ProfileHeader() {
  const { initials, displayName, photoUrl, id, username } = useUser();

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Avatar src={photoUrl} acronym={initials} size={72} className="bg-[#ffb14c] text-white" />
      <div className="flex flex-col gap-0.5">
        <p className="text-[20px] leading-6 font-bold text-[#1b2027] capitalize dark:text-white">
          {displayName}
        </p>
        <p className="text-[13px] leading-4 text-[#64748b] dark:text-[#94a3b8]">
          {username ? `@${username} · ` : ""}ID {id || "—"}
        </p>
      </div>
    </div>
  );
}
