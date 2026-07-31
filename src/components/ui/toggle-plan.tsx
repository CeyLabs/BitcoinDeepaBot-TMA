"use client";

import { cn } from "@/lib/cn";

export type PlanDuration = "weekly" | "monthly";

interface TogglePlanProps {
  value: PlanDuration;
  onChange: (value: PlanDuration) => void;
  className?: string;
}

export function TogglePlan({ value, onChange, className }: TogglePlanProps) {
  return (
    <div
      className={cn("flex items-start rounded-full bg-[#f1f5f9] p-1 dark:bg-[#242b35]", className)}
    >
      {(["weekly", "monthly"] as PlanDuration[]).map((option) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "flex w-[175px] items-center justify-center rounded-full px-6 py-1",
              "text-center text-[14px] leading-[28px] font-semibold transition-colors",
              isActive
                ? "bg-white text-[#fa7119] dark:bg-[#0b0f14]"
                : "bg-transparent text-[#64748b] dark:text-[#94a3b8]"
            )}
          >
            {option === "weekly" ? "Weekly" : "Monthly"}
          </button>
        );
      })}
    </div>
  );
}
