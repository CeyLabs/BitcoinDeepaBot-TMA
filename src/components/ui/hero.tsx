import Image from "next/image";
import { cn } from "cn";

/**
 * Brand image card (orange wallet art by default) with white text. The
 * Total value, Manage my plan and Task earnings cards use it.
 */
export function Hero({
  src = "/bg/hero-orange.webp",
  className,
  innerClassName,
  priority,
  children,
}: {
  src?: string;
  className?: string;
  innerClassName?: string;
  priority?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-xl text-white", className)}>
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 448px) 100vw, 448px"
        className="-z-10 scale-[1.02] object-cover"
      />
      <div className={cn("relative flex flex-col gap-2 px-3 py-4", innerClassName)}>{children}</div>
    </div>
  );
}

/** Translucent white panel on a Hero ("You invested | Current value"). */
export function HeroGlass({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-stretch gap-3 rounded-xl bg-white/18 p-3", className)}>
      {children}
    </div>
  );
}

/** One labelled value inside a HeroGlass. */
export function HeroStat({
  label,
  value,
  align = "start",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  align?: "start" | "end";
}) {
  return (
    <div className={cn("flex flex-1 flex-col gap-1", align === "end" && "items-end text-right")}>
      <span className="text-[12px] leading-4 font-semibold text-white/88">{label}</span>
      <span className="num text-[16px] leading-5 font-bold">{value}</span>
    </div>
  );
}

export function HeroDivider() {
  return <span aria-hidden className="w-px self-stretch bg-white/35" />;
}
