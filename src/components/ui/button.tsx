"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  [
    "press relative inline-flex max-w-full items-center justify-center gap-2 overflow-hidden border-0",
    "font-bold whitespace-nowrap select-none",
  ],
  {
    variants: {
      variant: {
        /** Orange primary (the main call to action). */
        default:
          "bg-primary text-primary-foreground disabled:bg-disabled disabled:text-on-disabled",
        /** Dark ink fill (e.g. "Change plan" on the hero). */
        inverse: "bg-inv text-on-inv disabled:bg-disabled disabled:text-on-disabled",
        /** Neutral chip fill. */
        secondary: "bg-chip text-foreground disabled:opacity-70",
        /** Kept for older call sites; same as secondary. */
        outline: "bg-chip text-foreground disabled:opacity-70",
        /** White tile on a brand image. */
        onBrand: "bg-onbrand-tile text-onbrand-tile-ink",
        /** Red fill for destructive confirmations. */
        destructive: "bg-destructive text-white dark:text-black",
        /** Text-only link-coloured button. */
        text: "text-link bg-transparent",
      },
      size: {
        /** Full-width 50px bar. */
        lg: "h-[50px] w-full rounded-xl px-5 text-[16px]",
        default: "h-11 rounded-xl px-4 text-[15px]",
        /** Small 36px action ("Start", "Copy", "Verify"). */
        sm: "hit h-9 min-w-16 rounded-lg px-3 text-[13px]",
        /** Text buttons keep a 44px touch target. */
        text: "min-h-11 rounded-xl px-2.5 text-[14px]",
      },
    },
    defaultVariants: { variant: "default", size: "lg" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Shows a spinner in place of the content (and disables the button). */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  type = "button",
  children,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
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
          <Spinner />
        </span>
      )}
    </button>
  );
}

/** Small ring spinner in the current text colour. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent",
        className
      )}
    />
  );
}

export { buttonVariants };
