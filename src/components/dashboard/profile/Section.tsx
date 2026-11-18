import { cn } from "cn";

/** Titled group of rows on the profile page. */
export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[13px] leading-4 font-semibold tracking-wide text-[#64748b] uppercase dark:text-[#94a3b8]">
        {title}
      </h2>
      <div
        className={cn(
          "bg-card divide-border flex flex-col divide-y overflow-hidden rounded-2xl shadow-[0px_2px_10px_0px_rgba(0,0,0,0.05)]",
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}
