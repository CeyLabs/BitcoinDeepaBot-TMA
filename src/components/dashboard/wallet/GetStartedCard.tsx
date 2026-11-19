"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Card } from "@/components/ui/card";
import { Emoji } from "@/components/ui/emoji";
import { Section } from "@/components/ui/section";
import { useSheets } from "@/components/dashboard/sheets";
import { useBankAccounts } from "@/hooks/query/useBankAccounts";
import { useUser } from "@/hooks/useUser";
import { useUserMe } from "@/hooks/query/useUserMe";
import { UsernameSheet } from "@/components/dashboard/settings/UsernameSheet";
import { haptic } from "@/platform";

const TITLES = [
  "Four steps to get set up",
  "Nice start, 3 to go",
  "Halfway there, 2 to go",
  "Almost there, 1 to go",
];
const RING = 113.1; // 2πr for r = 18

/** Onboarding checklist on the wallet; hidden once every step is done. */
export function GetStartedCard({ hasSats }: { hasSats: boolean }) {
  const router = useRouter();
  const { openTrade, openSettings } = useSheets();
  const { kycStatus } = useUser();
  const { current: bankAccount, isLoading: bankLoading } = useBankAccounts();
  const { data: me, isLoading: meLoading } = useUserMe();
  const [claiming, setClaiming] = useState(false);

  // Don't flash the card for members who are already set up.
  if (kycStatus === undefined || bankLoading || meLoading) return null;

  const steps = [
    {
      label: "Verify your identity",
      sub: "Needed once before you buy or sell",
      img: "/emoji/animated/id-card.webp",
      done: kycStatus === "APPROVED",
      go: () => router.push("/verification"),
    },
    {
      label: "Get your first sats",
      sub: "Buy any amount, or start a plan",
      img: "/emoji/coins.webp",
      done: hasSats,
      go: () => openTrade("buy"),
    },
    {
      label: "Add a bank account",
      sub: "Where your rupees go when you sell",
      img: "/emoji/wallet.webp",
      done: !!bankAccount,
      go: openSettings,
    },
    {
      label: "Set up your username",
      sub: "So others can send you sats",
      img: "/emoji/community.webp",
      done: !!me?.username,
      go: () => setClaiming(true),
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <Section title="Get started">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <svg
            className="shrink-0 -rotate-90"
            width="36"
            height="36"
            viewBox="0 0 44 44"
            aria-hidden
          >
            <circle cx="22" cy="22" r="18" fill="none" strokeWidth="4" className="stroke-chip" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-primary transition-[stroke-dashoffset] duration-800 ease-(--ease-spring)"
              style={{
                strokeDasharray: RING,
                strokeDashoffset: RING * (1 - doneCount / steps.length),
              }}
            />
          </svg>
          <span className="flex min-w-0 grow flex-col gap-1 pl-0.5">
            <span className="text-[16px] leading-[18px] font-semibold">{TITLES[doneCount]}</span>
            <span className="text-ink3 text-[13px] leading-4">
              {doneCount} of {steps.length} done
            </span>
          </span>
        </div>
        {steps.map((s) => (
          <button
            key={s.label}
            type="button"
            disabled={s.done}
            onClick={() => {
              haptic.impact("light");
              s.go();
            }}
            className="press before:bg-line relative flex min-h-14 w-full items-center gap-3 border-0 bg-transparent px-4 py-3 text-left before:absolute before:top-0 before:right-0 before:left-[58px] before:h-px active:scale-100!"
          >
            <span
              className={cn(
                "mx-[5px] flex size-[26px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                s.done ? "animate-pop border-success bg-success text-card" : "border-line"
              )}
            >
              {s.done && (
                <svg
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
            </span>
            <span className="flex min-w-0 grow flex-col gap-1 pl-0.5">
              <span
                className={cn(
                  "text-[16px] leading-[18px] font-semibold",
                  s.done && "text-ink3 line-through"
                )}
              >
                {s.label}
              </span>
              <span className="text-ink3 truncate text-[13px] leading-4">{s.sub}</span>
            </span>
            {!s.done && <Emoji src={s.img} size={30} />}
          </button>
        ))}
      </Card>
      <UsernameSheet open={claiming} onOpenChange={setClaiming} />
    </Section>
  );
}
