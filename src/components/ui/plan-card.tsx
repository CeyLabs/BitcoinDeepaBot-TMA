"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

const RadioDefault = () => (
  <div className="size-5 rounded-full border-2 border-[#e2e8f0] bg-white dark:border-[#334155] dark:bg-transparent" />
);

const RadioSelected = () => (
  <div className="flex size-5 items-center justify-center rounded-full border-2 border-[#fa7119] bg-white dark:bg-transparent">
    <div className="size-2.5 rounded-full bg-[#fa7119]" />
  </div>
);

const CheckSelected = () => (
  <div className="flex size-5 items-center justify-center rounded-full border-2 border-[#16a34a] bg-white dark:bg-transparent">
    <Check className="size-3 text-[#16a34a]" strokeWidth={3} />
  </div>
);

export interface PlanCardProps {
  emoji: React.ReactNode;
  name: string;
  price: string;
  period: string;
  description: string;
  perMonth?: string;
  perYear: string;
  selected?: boolean;
  active?: boolean;
  mostPopular?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function PlanCard({
  emoji,
  name,
  price,
  period,
  description,
  perMonth,
  perYear,
  selected = false,
  active = false,
  mostPopular = false,
  onSelect,
  className,
}: PlanCardProps) {
  const isHighlighted = selected || active;
  const Component = active ? "div" : "button";

  return (
    <Component
      type={active ? undefined : "button"}
      onClick={
        active
          ? undefined
          : () => {
              haptic.select();
              onSelect?.();
            }
      }
      className={cn(
        "relative w-full rounded-[12px] text-left",
        "flex flex-col items-end pt-0",
        "shadow-[-0.1px_-0.1px_10px_0px_rgba(203,213,225,0.3),3px_3px_7px_0px_rgba(203,213,225,0.3)] dark:shadow-none",
        "transition-all duration-150",
        active
          ? "border border-[#16a34a] bg-white dark:bg-[#0b0f14]"
          : isHighlighted
            ? "border border-[#fa7119] bg-[#eeeff3] dark:bg-[#1b2027]"
            : "border border-transparent bg-white dark:border-[#1b2027] dark:bg-[#0b0f14]",
        !active &&
          "focus-visible:ring-2 focus-visible:ring-[#fa7119]/50 focus-visible:outline-hidden",
        className
      )}
    >
      {active && (
        <div className="absolute top-3 right-4">
          <div className="flex h-5 items-center justify-center rounded-full bg-[#16a34a] px-2.5">
            <p className="text-[12px] leading-[16px] whitespace-nowrap text-white">Current Plan</p>
          </div>
        </div>
      )}
      {mostPopular && !active && (
        <div className="relative mb-[-10px] flex shrink-0 flex-col items-start self-end px-[10px] pt-[6px]">
          <div className="flex h-4 items-center justify-center rounded-full bg-[#fa7119] px-2.5">
            <p className="text-[12px] leading-[16px] whitespace-nowrap text-[#eeeff3]">
              Most Popular
            </p>
          </div>
        </div>
      )}
      <div className={cn("flex w-full flex-col items-start gap-0 px-4 py-5", active && "pt-6")}>
        {/* Top row: radio + emoji + name + price */}
        <div className="flex h-10 w-full items-center gap-2">
          <div className="flex shrink-0 items-center gap-2">
            {active ? <CheckSelected /> : isHighlighted ? <RadioSelected /> : <RadioDefault />}
            <div className="flex size-10 items-center justify-center">{emoji}</div>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between leading-[16px] tracking-normal whitespace-nowrap">
            <p className="text-[16px] font-semibold text-[#1b2027] dark:text-white">{name}</p>
            <div className="flex items-end gap-0.5 text-center">
              <p
                className={cn(
                  "text-[18px] font-bold",
                  active ? "text-[#16a34a]" : "text-[#fa7119]"
                )}
              >
                {price}
              </p>
              <p className="pb-0.5 text-[12px] font-normal text-[#e2e8f0] dark:text-[#475569]">
                {period}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: description + pricing */}
        <div className="mt-1 flex w-full flex-col items-start gap-0.5 pl-[31px]">
          <p className="w-full text-[14px] leading-[16px] font-normal text-[#475569] dark:text-[#94a3b8]">
            {description}
          </p>
          <div className="flex w-full items-center gap-2">
            {perMonth && (
              <>
                <p className="text-[12px] leading-[16px] font-normal whitespace-nowrap text-[#64748b] dark:text-[#64748b]">
                  {perMonth}
                </p>
                <div className="h-3 w-px bg-[#e2e8f0] dark:bg-[#334155]" />
              </>
            )}
            <p className="text-[12px] leading-[16px] font-normal whitespace-nowrap text-[#64748b] dark:text-[#64748b]">
              {perYear}
            </p>
          </div>
        </div>
      </div>
    </Component>
  );
}
