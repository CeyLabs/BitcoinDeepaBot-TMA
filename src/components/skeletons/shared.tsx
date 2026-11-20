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
      className={cn("rounded-xl bg-[#f8931a] px-3 py-4 [--bone:rgb(255_255_255/0.28)]", className)}
    >
      {children}
    </div>
  );
}
