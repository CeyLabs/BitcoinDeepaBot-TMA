"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Title } from "@telegram-apps/telegram-ui";
import { useTheme } from "@/app/context/theme";
import { clearAuthFromStorage } from "@/lib/auth";
import { TELEGRAM_BOT_URL } from "@/lib/constants";

interface BrowserAuthenticatedScreenProps {
  onSignOut: () => void;
}

/**
 * Shown after a successful browser sign-in. The dashboard and other routes
 * still depend on Mini App initData (via useLaunchParams/useInitData) and
 * aren't safe to render outside Telegram yet, so this is a holding screen
 * rather than a redirect into /dashboard.
 */
export default function BrowserAuthenticatedScreen({ onSignOut }: BrowserAuthenticatedScreenProps) {
  const { isDark } = useTheme();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center dark:bg-[#1b2027]">
      <div className="relative mb-5 h-[150px] w-[220px]">
        <Image
          src={isDark ? "/BDLogo_White.svg" : "/BDLogo_Black.svg"}
          alt="Bitcoin Deepa"
          fill
          priority
          sizes="220px"
          className="object-contain"
        />
      </div>

      <Title level="2" weight="2" className="max-w-sm leading-snug">
        You&apos;re Signed In
      </Title>

      <p className="text-muted-foreground mt-2 max-w-sm text-[15px] dark:text-[#64748b]">
        Open Bitcoin Deepa in Telegram to access your wallet, plans, and activity.
      </p>

      <Link href={TELEGRAM_BOT_URL} className="mt-8 block w-full max-w-xs">
        <Button mode="filled" size="l" stretched style={{ borderRadius: "12px" }}>
          Open in Telegram
        </Button>
      </Link>

      <button
        type="button"
        onClick={() => {
          clearAuthFromStorage();
          onSignOut();
        }}
        className="text-muted-foreground mt-4 text-[13px] underline dark:text-[#64748b]"
      >
        Sign Out
      </button>
    </main>
  );
}
