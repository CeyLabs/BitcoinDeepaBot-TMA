"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Cell } from "@/components/ui/cell";
import { BankAccountCard } from "@/components/dashboard/profile/BankAccountCard";
import { KycStatusCell } from "@/components/dashboard/profile/KycStatusCell";
import { PersonalDetailsCard } from "@/components/dashboard/profile/PersonalDetailsCard";
import { ProfileHeader } from "@/components/dashboard/profile/ProfileHeader";
import { Section } from "@/components/dashboard/profile/Section";
import { useSession } from "@/hooks/useSession";
import { haptic, usePlatform } from "@/platform";

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useSession();
  const { kind } = usePlatform();

  return (
    <div className="flex w-full flex-col gap-6">
      <BackButton onBack={() => router.push("/dashboard")} />
      <ProfileHeader />
      <KycStatusCell />
      <BankAccountCard />
      <PersonalDetailsCard />
      {kind === "web" && (
        <Section title="Account">
          <Cell
            as="button"
            className="text-[#f13131] [--cell-py:14px]"
            before={<LogOut size={20} />}
            onClick={() => {
              haptic.impact("medium");
              logout();
            }}
          >
            Log out
          </Cell>
        </Section>
      )}
    </div>
  );
}
