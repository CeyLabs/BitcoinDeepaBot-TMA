"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "success";
export type ButtonSize = "default" | "auto";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#fa7119] text-white hover:bg-[#e8661a] active:bg-[#d45e18]",
  secondary:
    "border-2 border-[#fa7119] text-[#fa7119] bg-transparent hover:bg-[#fa7119]/5 active:bg-[#fa7119]/10",
  ghost: "text-[#fa7119] bg-transparent shadow-none hover:bg-[#fa7119]/5 active:bg-[#fa7119]/10",
  destructive:
    "border-2 border-[#f13131] text-[#f13131] bg-transparent hover:bg-[#f13131]/5 active:bg-[#f13131]/10",
  success: "bg-[#22c55e] text-white hover:bg-[#16a34a] active:bg-[#15803d]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-[50px] w-full",
  auto: "h-[50px] w-auto",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      loading = false,
      disabled,
      leftIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-4",
          "text-[16px] font-semibold leading-[18px] tracking-normal whitespace-nowrap",
          "shadow-[1px_1px_6px_0px_rgba(203,213,225,0.3)]",
          "transition-all duration-150 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa7119]/50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
