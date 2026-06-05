"use client";

import { cn } from "@/lib/cn";

interface CategoryFilterProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryFilter({
  label,
  selected = false,
  onClick,
  className,
}: CategoryFilterProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center px-5 py-2 rounded-[12px]",
        "text-[16px] font-semibold leading-[18px] text-center whitespace-nowrap",
        "drop-shadow-[1px_1px_3px_rgba(203,213,225,0.3)] transition-colors",
        selected
          ? "bg-[#fa7119] text-white"
          : "bg-[#e2e8f0] text-[#1b2027]",
        className
      )}
    >
      {label}
    </button>
  );
}

interface CategoryFilterGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CategoryFilterGroup({
  options,
  value,
  onChange,
  className,
}: CategoryFilterGroupProps) {
  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      {options.map((option) => (
        <CategoryFilter
          key={option}
          label={option}
          selected={value === option}
          onClick={() => onChange(option)}
        />
      ))}
    </div>
  );
}
