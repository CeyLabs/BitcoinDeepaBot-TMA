"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAvatarSeed, useUserMe } from "@/hooks/query/useUserMe";
import { UsernameSheet } from "./UsernameSheet";
import { AvatarPickerSheet } from "./AvatarPickerSheet";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { List, ListRow, Section } from "@/components/ui/section";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { useTheme, type ThemePreference } from "@/app/context/theme";
import { useBalanceVisible } from "@/hooks/useBalanceVisible";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/lib/types";
import { haptic, usePlatform } from "@/platform";
import { Icon } from "./icons";
import { InstallButton, useInstallKind } from "@/pwa";
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
  const { displayName, kycStatus } = useUser();
  const ourUsername = useUserMe().data?.username;
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
          className="bg-card text-link shadow-card absolute -top-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full"
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
      <div className="flex min-w-0 grow flex-col gap-0.5">
        <p className="truncate text-[18px] leading-[22px] font-bold">{displayName}</p>
        {ourUsername && <p className="text-ink3 truncate text-[13px] leading-4">@{ourUsername}</p>}
      </div>
      {kycStatus !== undefined &&
        (kycStatus === "APPROVED" ? (
          <Badge variant="active" className="shrink-0">
            <BadgeDot />
            Verified
          </Badge>
        ) : (
          <Badge variant="soft" className="shrink-0">
            Not verified
          </Badge>
        ))}
    </div>
  );
}

function UsernameRow() {
  const { data: me } = useUserMe();
  const [open, setOpen] = useState(false);
  const username = me?.username;
  return (
    <>
      <ListRow
        icon={<span className="text-ink2 text-[18px] font-extrabold">@</span>}
        title="BitcoinDeepa username"
        subtitle={username ? `@${username}` : "So others can send you sats"}
        after={
          me && !username ? (
            <Button
              size="sm"
              onClick={() => {
                haptic.impact("light");
                setOpen(true);
              }}
            >
              Set up
            </Button>
          ) : username ? (
            <CopyButton value={`@${username}`} label="username" />
          ) : null
        }
      />
      <UsernameSheet open={open} onOpenChange={setOpen} />
    </>
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
      icon={<Icon name="idCard" className="text-ink2" />}
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
  // Install shows only in a browser that can install (not Telegram, not once installed).
  const installKind = useInstallKind();
  const canInstall = kind === "web" && installKind !== null;
  const { logout } = useSession();
  const toast = useToast();
  const logOut = (everywhere: boolean) => {
    haptic.impact("medium");
    onNavigate?.();
    logout(everywhere).catch(() => {
      haptic.notify("error");
      toast({
        type: "error",
        title: "Couldn't log out",
        description: "Check your connection and try again. You're still logged in.",
      });
    });
  };
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
          <UsernameRow />
          <ListRow
            icon={<Icon name="eye" className="text-ink2" />}
            title="Hide balances"
            subtitle="Mask amounts on screen"
            after={<Switch label="Hide balances" checked={!visible} onCheckedChange={toggle} />}
          />
        </List>
      </Section>

      <PayoutAccountSection />

      <PersonalDetailsSection onCompleteProfile={() => go("/verification/details")} />

      {canInstall && (
        <List>
          <InstallButton variant="row" />
        </List>
      )}

      <List>
        {kind === "web" && (
          <ListRow
            onClick={() => logOut(false)}
            icon={<Icon name="logout" className="text-loss" />}
            title={<span className="text-loss">Log out</span>}
          />
        )}
        <ListRow
          onClick={() => logOut(true)}
          icon={<Icon name="logout" className="text-loss" />}
          title={<span className="text-loss">Log out of all devices</span>}
          subtitle="Ends every session, on every phone and browser"
        />
      </List>
    </div>
  );
}
