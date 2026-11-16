import { cn } from "cn";

/** Orange-tinted card that stands in for the photo hero cards (Total Value, plan hero). */
export function HeroCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-[#fa7119]/15 p-4 [--bone:rgb(255_255_255/0.6)] dark:bg-[#fa7119]/10 dark:[--bone:rgb(255_255_255/0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}
