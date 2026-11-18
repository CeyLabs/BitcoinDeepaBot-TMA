import { cn } from "cn";

/** Rounded surface with a soft shadow. Style the background per use. */
export function Card({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }) {
  return (
    <article
      ref={ref}
      className={cn(
        "bg-tertiary relative inline-block overflow-hidden rounded-[20px] shadow-[0_32px_64px_0_rgba(0,0,0,0.04),0_0_2px_1px_rgba(0,0,0,0.02)]",
        className
      )}
      {...props}
    />
  );
}
