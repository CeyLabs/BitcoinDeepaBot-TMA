"use client";

import { cn } from "cn";
import { haptic } from "@/platform";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

/** iOS-style switch. */
export function Switch({ checked, onCheckedChange, label, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        haptic.select();
        onCheckedChange(!checked);
      }}
      className={cn(
        "press relative h-[31px] w-[51px] shrink-0 rounded-full border-0 disabled:opacity-50",
        "after:absolute after:top-0.5 after:left-0.5 after:size-[27px] after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.25)] after:transition-transform after:duration-300 after:ease-(--ease-spring)",
        checked ? "bg-primary after:translate-x-5" : "bg-line",
        className
      )}
    />
  );
}
