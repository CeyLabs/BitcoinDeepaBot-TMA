"use client";

import { cn } from "@/lib/cn";

const RadioDefault = () => (
  <div className="size-5 rounded-full border-2 border-[#e2e8f0] bg-white" />
);

const RadioSelected = () => (
  <div className="size-5 rounded-full border-2 border-[#fa7119] bg-white flex items-center justify-center">
    <div className="size-2.5 rounded-full bg-[#fa7119]" />
  </div>
);

export interface PlanCardProps {
  emoji: React.ReactNode;
  name: string;
  price: string;
  period: string;
  description: string;
  perMonth: string;
  perYear: string;
  selected?: boolean;
  active?: boolean;
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
  onSelect,
  className,
}: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left bg-white rounded-[12px]",
        "flex flex-col items-end pb-4 pt-0",
        "shadow-[-0.1px_-0.1px_10px_0px_rgba(203,213,225,0.3),3px_3px_7px_0px_rgba(203,213,225,0.3)]",
        "transition-all duration-150",
        selected && "ring-2 ring-[#fa7119] bg-[#fa7119]/[0.03]",
        active && "ring-2 ring-[#fa7119] bg-[#fa7119]/[0.03]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa7119]/50",
        className
      )}
    >
      <div className="flex flex-col items-start w-full px-4 py-5 gap-0">
        {/* Top row: radio + emoji + name + price */}
        <div className="flex items-center gap-2 w-full h-10">
          <div className="flex items-center gap-2 shrink-0">
            {selected ? <RadioSelected /> : <RadioDefault />}
            <div className="size-10 flex items-center justify-center">{emoji}</div>
          </div>
          <div className="flex flex-1 items-center justify-between min-w-0 leading-[16px] tracking-normal whitespace-nowrap">
            <p className="text-[16px] font-semibold text-[#1b2027]">{name}</p>
            <div className="flex items-end gap-0.5 text-center">
              <p className="text-[18px] font-bold text-[#fa7119]">{price}</p>
              <p className="text-[12px] font-normal text-[#e2e8f0] pb-0.5">{period}</p>
            </div>
          </div>
        </div>

        {/* Bottom: description + pricing */}
        <div className="flex flex-col items-start pl-[31px] w-full mt-1 gap-0.5">
          <p className="text-[14px] font-normal leading-[16px] text-[#475569] w-full">
            {description}
          </p>
          <div className="flex items-center gap-2 w-full">
            <p className="text-[12px] font-normal leading-[16px] text-[#64748b] whitespace-nowrap">
              {perMonth}
            </p>
            <div className="w-px h-3 bg-[#e2e8f0]" />
            <p className="text-[12px] font-normal leading-[16px] text-[#64748b] whitespace-nowrap">
              {perYear}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
