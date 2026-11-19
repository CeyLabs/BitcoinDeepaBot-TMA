"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAvatarSeed } from "@/hooks/query/useUserMe";
import { AvatarPickerSheet } from "./AvatarPickerSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Emoji } from "@/components/ui/emoji";
import { List, ListRow, Section } from "@/components/ui/section";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { useTheme, type ThemePreference } from "@/app/context/theme";
import { useBalanceVisible } from "@/hooks/useBalanceVisible";
import { useSession } from "@/hooks/useSession";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/lib/types";
import { haptic, usePlatform } from "@/platform";
import { Icon } from "./icons";
import { PayoutAccountSection } from "./PayoutAccountSection";
import { PersonalDetailsSection } from "./PersonalDetailsSection";

type KycStatus = NonNullable<User["kycStatus"]>;

const THEME_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const satisfies readonly { value: ThemePreference; label: string }[];

const IDENTITY_TEXT: Partial<Record<KycStatus, string>> = {
  APPROVED: "Your identity is verified",
  IN_REVIEW: "In review. We'll let you know when it's done",
  IN_PROGRESS: "Started. Finish it to buy and sell",
  DECLINED: "Declined. You can try again",
  EXPIRED: "Expired. Please verify again",
  KYC_EXPIRED: "Expired. Please verify again",
  ABANDONED: "Not finished. Pick up where you left off",
};

function ProfileRow() {
  const { displayName, username, kycStatus } = useUser();
  const avatarSeed = useAvatarSeed();
  const [picking, setPicking] = useState(false);
  return (
    <div className="bg-chip flex items-center gap-3.5 rounded-xl p-3.5">
      <button
        type="button"
        aria-label="Change profile picture"
        onClick={() => {
          haptic.impact("light");
          setPicking(true);
        }}
        className="press relative shrink-0 rounded-full border-0 bg-transparent p-0"
      >
        <UserAvatar seed={avatarSeed} size={56} />
        <span
          aria-hidden
          className="bg-card text-link shadow-card absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </span>
      </button>
      <AvatarPickerSheet open={picking} onOpenChange={setPicking} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-[18px] leading-[22px] font-bold">{displayName}</p>
        <p className="text-ink3 truncate text-[13px] leading-4">
          {kycStatus === undefined
            ? username
              ? `@${username}`
              : " "
            : kycStatus === "APPROVED"
              ? "Verified member"
              : "Not verified yet"}
        </p>
      </div>
    </div>
  );
}

function IdentityRow({ onVerify }: { onVerify: () => void }) {
  const { kycStatus } = useUser();
  const status = kycStatus ?? "NOT_STARTED";

  let after: React.ReactNode = null;
  if (kycStatus === undefined) after = null;
  else if (status === "APPROVED") after = <Badge variant="active">Verified</Badge>;
  else if (status === "IN_REVIEW") after = <Badge variant="pending">In review</Badge>;
  else
    after = (
      <Button size="sm" onClick={onVerify}>
        {status === "IN_PROGRESS" ? "Continue" : "Verify"}
      </Button>
    );

  return (
    <ListRow
      icon={<Emoji src="/emoji/animated/id-card.webp" size={26} />}
      title="Identity"
      subtitle={IDENTITY_TEXT[status] ?? "Needed to buy plans and sell sats"}
      after={after}
    />
  );
}

/**
 * Profile & settings, shared by the avatar sheet and the /dashboard/profile
 * page. `onNavigate` runs before leaving for another route (the sheet closes
 * itself there).
 */
export function SettingsContent({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { kind } = usePlatform();
  const { logout } = useSession();
  const { preference, setPreference } = useTheme();
  const { visible, toggle } = useBalanceVisible();

  const go = (href: string) => {
    haptic.impact("light");
    onNavigate?.();
    router.push(href);
  };

  return (
    <div className={cn("stagger flex flex-col gap-5", className)}>
      <ProfileRow />

      <Section title="Appearance">
        <Segmented
          label="Appearance"
          options={THEME_OPTIONS}
          value={preference}
          onChange={setPreference}
        />
      </Section>

      <Section title="Account">
        <List>
          <IdentityRow onVerify={() => go("/verification")} />
          <ListRow
            icon={<Icon name="eye" className="text-ink2" />}
            title="Hide balances"
            subtitle="Mask amounts on screen"
            after={<Switch label="Hide balances" checked={!visible} onCheckedChange={toggle} />}
          />
          <ListRow
            icon={<Icon name="globe" className="text-ink2" />}
            title="Language"
            subtitle="English · Sinhala coming soon"
          />
        </List>
      </Section>

      <PayoutAccountSection />

      <PersonalDetailsSection onCompleteProfile={() => go("/verification/details")} />

      {kind === "web" && (
        <List>
          <ListRow
            onClick={() => {
              haptic.impact("medium");
              onNavigate?.();
              logout();
            }}
            icon={<Icon name="logout" className="text-loss" />}
            title={<span className="text-loss">Log out</span>}
          />
        </List>
      )}
    </div>
  );
}
