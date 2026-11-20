"use client";

import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Emoji } from "@/components/ui/emoji";
import { haptic } from "@/platform";

export interface PlanCardProps {
  emojiSrc: string;
  name: string;
  price: string;
  /** e.g. "/week" */
  period: string;
  selected?: boolean;
  /** The user's active plan: shows a "Current" badge. */
  current?: boolean;
  popular?: boolean;
  /** Revealed under the row while selected (estimate, fee line). */
  details?: React.ReactNode;
  onSelect: () => void;
  className?: string;
}

/** Selectable plan row (radio, emoji, name, price) that expands when picked. */
export function PlanCard({
  emojiSrc,
  name,
  price,
  period,
  selected = false,
  current = false,
  popular = false,
  details,
  onSelect,
  className,
}: PlanCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => {
        if (selected) return;
        haptic.select();
        onSelect();
      }}
      className={cn(
        "press bg-card shadow-card relative block w-full rounded-xl border-0 px-4 py-[18px] text-left",
        "transition-[box-shadow,background-color] duration-200",
        selected && "shadow-[0_0_0_2px_var(--color-primary),0_6px_18px_rgba(248,147,26,0.18)]",
        className
      )}
    >
      <span className="flex w-full items-center gap-2.5">
        <span
          aria-hidden
          className={cn(
            "bg-card flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
            selected ? "border-primary" : "border-line"
          )}
        >
          <i
            className={cn(
              "bg-primary size-2.5 rounded-full transition-transform duration-[350ms] ease-(--ease-pop)",
              selected ? "scale-100" : "scale-0"
            )}
          />
        </span>
        <Emoji
          src={emojiSrc}
          size={40}
          className={cn(
            "transition-transform duration-[450ms] ease-(--ease-pop)",
            selected && "scale-[1.15] -rotate-[7deg]"
          )}
        />
        <span className="flex min-w-0 grow items-center gap-2">
          <span className="truncate text-[16px] font-semibold">{name}</span>
          {current ? (
            <Badge className="bg-success text-card h-5">Current</Badge>
          ) : (
            popular && (
              <Badge variant="pending" className="h-5">
                Popular
              </Badge>
            )
          )}
        </span>
        <span className="flex shrink-0 items-baseline gap-0.5">
          <span className="num text-link text-[16px] leading-[18px] font-bold">{price}</span>
          <span className="text-ink3 text-[12px] leading-4">{period}</span>
        </span>
      </span>
      {details && (
        <span
          className={cn(
            "grid transition-[grid-template-rows] duration-[360ms] ease-(--ease-out-soft)",
            selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <span className="block overflow-hidden" aria-hidden={!selected}>
            <span className="flex flex-col gap-0.5 pt-2.5 pl-[30px]">{details}</span>
          </span>
        </span>
      )}
    </button>
  );
}
