"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Card } from "@/components/ui/card";
import { Emoji } from "@/components/ui/emoji";
import { Progress } from "@/components/ui/progress";
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

/** Onboarding checklist on the wallet; hidden once every step is done. */
export function GetStartedCard({ hasSats }: { hasSats: boolean }) {
  const router = useRouter();
  const { openTrade, openAddBank } = useSheets();
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
      // The form needs a verified identity: send unverified members there first.
      go: () => (kycStatus === "APPROVED" ? openAddBank() : router.push("/verification")),
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
        <div className="flex flex-col gap-2.5 px-4 pt-3.5 pb-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[16px] leading-[18px] font-semibold">{TITLES[doneCount]}</span>
            <span className="text-ink3 shrink-0 text-[13px] leading-4">
              {doneCount} of {steps.length} done
            </span>
          </div>
          <Progress
            value={(doneCount / steps.length) * 100}
            label={`${doneCount} of ${steps.length} setup steps done`}
          />
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
