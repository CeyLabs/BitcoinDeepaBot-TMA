import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "mx-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-[20px] px-[5px] text-[13px] leading-5 font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        /** Profit / positive change (wallet cards). */
        gain: "bg-[#158348] text-white",
        /** Loss / negative change (wallet cards). */
        loss: "bg-[rgba(241,49,49,0.62)] text-white",
        success: "bg-success text-white",
        /** Soft green status pill ("Active"). */
        active: "bg-[rgba(37,167,97,0.1)] text-[#25a761]",
        /** Soft amber status pill ("In review", "Processing"). */
        pending: "bg-[rgba(245,158,11,0.12)] text-[#b45309] dark:text-[#fbbf24]",
        /** Soft red status pill ("Rejected", "Failed"). */
        negative: "bg-[rgba(241,49,49,0.1)] text-[#f13131]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** Small pill for counts and short labels (e.g. "Active", "+2.4%"). */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
