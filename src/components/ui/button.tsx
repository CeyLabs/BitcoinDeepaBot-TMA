"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "cn";

const buttonVariants = cva(
  [
    "relative isolate inline-flex max-w-full items-center justify-center overflow-hidden",
    "font-semibold whitespace-nowrap select-none transition-opacity duration-150",
    "cursor-pointer disabled:cursor-default disabled:opacity-35",
    "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
    // Hover tint drawn above the background (Tailwind v4 hover: only applies
    // on devices that can hover).
    "after:pointer-events-none after:absolute after:inset-0 after:bg-white after:opacity-0 after:transition-opacity after:duration-150 dark:after:bg-[#212121]",
    "enabled:hover:after:opacity-(--btn-hover-opacity)",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [--btn-hover-opacity:0.15]",
        outline:
          "text-secondary-foreground bg-inherit shadow-[0_0_0_1px_var(--outline)] [--btn-hover-opacity:0.5]",
        secondary: "bg-secondary text-secondary-foreground [--btn-hover-opacity:0.5]",
      },
      size: {
        sm: "h-9 min-w-[34px] gap-1.5 rounded-[20px] px-3 py-2 text-[15px] leading-[22px]",
        default: "h-[42px] min-w-[42px] gap-2 rounded-[8px] px-3.5 py-2 text-[15px] leading-[22px]",
        lg: "h-[50px] min-w-20 gap-2.5 rounded-[8px] px-5 py-2.5 text-[17px] leading-[26px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Shows a spinner in place of the content (and disables the button). */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, type = "button", children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      <span className={cn("contents", loading && "invisible")}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-5 animate-spin" aria-hidden />
        </span>
      )}
    </button>
  )
);
Button.displayName = "Button";

export { buttonVariants };
