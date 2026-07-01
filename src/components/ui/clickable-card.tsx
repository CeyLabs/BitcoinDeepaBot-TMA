"use client";

import { cn } from "@/lib/cn";

const ChevronRight = () => (
  <svg
    width="8"
    height="13"
    viewBox="0 0 7.50001 12.5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <path
      d="M0.750009 0.750009L6.75001 6.03L0.750009 11.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface ClickableCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  status?: "default" | "pressed" | "disabled" | "focus";
}

export function ClickableCard({
  icon,
  title,
  subtitle,
  onClick,
  disabled,
  className,
  status = "default",
}: ClickableCardProps) {
  const isDisabled = disabled || status === "disabled";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full bg-white dark:bg-[#0B0F14] rounded-[12px] px-4 py-3",
        "flex items-center justify-between gap-2",
        "shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)]",
        "transition-all duration-150",
        "active:scale-[0.99] active:shadow-[0px_1px_6px_0px_rgba(0,0,0,0.07)]",
        "hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.10)]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#fa7119]/50",
        className
      )}
    >
      {/* Left: icon + text */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="shrink-0 size-10 flex items-center justify-center">{icon}</div>
        <div className="flex flex-col gap-1 min-w-0 text-left">
          <p className="text-[16px] font-semibold leading-[20px] text-[#1b2027] dark:text-white truncate">
            {title}
          </p>
          <p className="text-[12px] font-normal leading-[16px] text-[#475569] dark:text-muted-foreground truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: arrow */}
      <div className="shrink-0 flex items-center justify-center size-6 text-[#64748b] dark:text-muted-foreground">
        <ChevronRight />
      </div>
    </button>
  );
}
