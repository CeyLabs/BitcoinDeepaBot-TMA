import { cn } from "cn";

/** White (dark: slate) rounded surface with the soft card shadow. `flat` drops the shadow. */
export function Card({
  className,
  flat = false,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { flat?: boolean; ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-card relative rounded-xl transition-[background-color,box-shadow] duration-300",
        !flat && "shadow-card",
        className
      )}
      {...props}
    />
  );
}
