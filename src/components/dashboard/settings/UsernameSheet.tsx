"use client";

import { useState } from "react";
import { cn } from "cn";
import { Button, Spinner } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useClaimUsername, useUsernameAvailability } from "@/hooks/query/useUserMe";
import { normalizeUsername, USERNAME_RULE } from "@/lib/username";
import { haptic } from "@/platform";

/**
 * Claim a Bitcoin Deepa @username (not the Telegram one): how others find
 * you to send sats. Once, it can't be changed later. Availability is checked
 * while typing.
 */
export function UsernameSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const toast = useToast();
  const [input, setInput] = useState("");
  const check = useUsernameAvailability(input);
  const claim = useClaimUsername();
  const typed = normalizeUsername(input);
  const checking = check.valid && (!check.settled || check.isFetching);
  const available = check.valid && check.settled && check.data?.available === true;

  let hint: React.ReactNode = "3-20 letters, digits or underscores. Starts with a letter.";
  let tone: "muted" | "ok" | "bad" = "muted";
  if (typed && !check.valid && check.settled) {
    hint = USERNAME_RULE;
    tone = "bad";
  } else if (checking) {
    hint = (
      <span className="inline-flex items-center gap-1.5">
        <Spinner className="size-3" /> Checking @{typed}…
      </span>
    );
  } else if (check.valid && check.data) {
    hint = check.data.available ? `@${typed} is available` : check.data.reason;
    tone = check.data.available ? "ok" : "bad";
  } else if (check.valid && check.error) {
    hint = "Couldn't check right now. Try again.";
    tone = "bad";
  }

  const confirm = () => {
    if (!available) return;
    claim.mutate(typed, {
      onSuccess: () => {
        haptic.notify("success");
        toast({ title: `You're @${typed}` });
        setInput("");
        onOpenChange(false);
      },
      onError: (e) => {
        haptic.notify("error");
        toast({ type: "error", title: "Couldn't claim it", description: e.message });
      },
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next && claim.isPending) return;
        onOpenChange(next);
      }}
      title="Your username"
      hideClose={claim.isPending}
      footer={
        <Button loading={claim.isPending} disabled={!available} onClick={confirm}>
          {available ? `Claim @${typed}` : "Claim username"}
        </Button>
      }
    >
      <div className="flex flex-col gap-3 px-4 pb-2">
        <p className="text-ink2 text-center text-[14px] leading-5">
          People send you sats with your Bitcoin Deepa @username. It&apos;s yours, not your Telegram
          one.
        </p>
        <div className="bg-chip flex h-[52px] items-center gap-1.5 rounded-xl px-3.5 focus-within:shadow-[0_0_0_2px_var(--ring)]">
          <span aria-hidden className="text-ink3 text-[18px] font-bold">
            @
          </span>
          <input
            aria-label="Username"
            aria-describedby="username-hint"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={21}
            placeholder="username"
            value={input.replace(/^@+/, "").toLowerCase()}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirm();
            }}
            className="text-foreground placeholder:text-ink3 h-full min-w-0 grow border-0 bg-transparent p-0 text-[17px] font-semibold outline-none placeholder:font-medium"
          />
          {available && (
            <svg
              className="text-success size-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          )}
        </div>
        <p
          id="username-hint"
          aria-live="polite"
          className={cn(
            "-mt-1 text-[12px] leading-4 font-semibold",
            tone === "ok" ? "text-success" : tone === "bad" ? "text-loss" : "text-ink3"
          )}
        >
          {hint}
        </p>
        <p className="bg-chip text-ink2 rounded-xl px-3.5 py-3 text-[13px] leading-[18px] font-semibold">
          One per person, and it can&apos;t be changed later. Pick carefully.
        </p>
      </div>
    </Sheet>
  );
}
