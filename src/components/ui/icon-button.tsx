"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const iconButtonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center transition-opacity duration-150",
    "cursor-pointer disabled:cursor-default disabled:opacity-35",
    "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
  ],
  {
    variants: {
      variant: {
        secondary: "bg-secondary text-secondary-foreground",
        outline: "text-secondary-foreground bg-inherit shadow-[0_0_0_1px_var(--outline)]",
      },
      size: {
        sm: "rounded-full p-1.5",
        default: "rounded-[12px] p-2",
      },
    },
    defaultVariants: { variant: "secondary", size: "default" },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {}

export function IconButton({
  className,
  variant,
  size,
  type = "button",
  ref,
  ...props
}: IconButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
