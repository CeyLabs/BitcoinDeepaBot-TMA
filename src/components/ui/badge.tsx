import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "inline-flex h-6 shrink-0 items-center gap-[5px] rounded-lg px-2.5 text-[12px] font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        /** Orange fill, black text ("Coming soon", task rewards). */
        default: "bg-primary text-primary-foreground",
        /** Soft green status ("Active", "Verified"). */
        active: "bg-gain-bg text-gain",
        /** Soft orange status ("Paused", "In review", "Processing"). */
        pending: "text-link bg-[rgba(248,147,26,0.16)]",
        /** Soft red status ("Rejected", "Failed"). */
        negative: "bg-loss-bg text-loss",
        /** Neutral chip ("Takes 2 minutes"). */
        soft: "bg-chip text-ink2",
        /** Solid green / red for profit and loss. */
        gain: "bg-gain-fill text-white",
        loss: "bg-loss-solid text-white",
        /** Dark ink fill. */
        dark: "bg-inv text-on-inv",
        /** White outline, for use on the orange hero images. */
        /** Older names, kept for existing call sites. */
        secondary: "bg-chip text-ink2",
        success: "bg-gain-fill text-white",
        onBrand: "h-auto border border-white bg-transparent px-2 py-1 leading-4 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** Small pill for statuses and short labels. */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** The little status dot used inside badges ("● Active"). */
export function BadgeDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full bg-current", className)} />
  );
}
