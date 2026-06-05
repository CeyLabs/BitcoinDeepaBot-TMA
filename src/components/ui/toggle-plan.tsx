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
      className={cn(
        "flex items-start p-1 rounded-full bg-[#f1f5f9]",
        className
      )}
    >
      {(["weekly", "monthly"] as PlanDuration[]).map((option) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "flex items-center justify-center px-6 py-1 rounded-full w-[175px]",
              "text-[14px] font-semibold leading-[28px] text-center transition-colors",
              isActive
                ? "bg-white text-[#fa7119]"
                : "bg-transparent text-[#64748b]"
            )}
          >
            {option === "weekly" ? "Weekly" : "Monthly"}
          </button>
        );
      })}
    </div>
  );
}
