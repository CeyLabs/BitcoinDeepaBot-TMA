import Image from "next/image";
import { cn } from "cn";
import { LandingShell } from "./LandingShell";

/** Green circle with a check that pops in and draws itself (success states). */
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-gain-bg text-gain animate-pop mx-auto flex size-20 items-center justify-center rounded-full",
        className
      )}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          className="animate-draw-check [stroke-dasharray:24] [stroke-dashoffset:24] motion-reduce:[stroke-dashoffset:0]"
        />
      </svg>
    </div>
  );
}

/** Large (100px) animated emoji for status screens. */
export function BigEmoji({ src, className }: { src: string; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={100}
      height={100}
      unoptimized
      priority
      className={cn("mx-auto size-[100px] object-contain max-[720px]:size-[84px]", className)}
    />
  );
}

/**
 * Centered result screen: an emoji (or <SuccessCheck />), title, message and
 * actions. Used by the error, not-found and payment result pages.
 */
export function StatusScreen({
  art,
  title,
  children,
  actions,
}: {
  art: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <LandingShell>
      <div className="stagger flex flex-col items-center gap-2 text-center">
        {art}
        <h1 className="mt-2 max-w-[330px] text-[24px] leading-7">{title}</h1>
        {children && <p className="text-ink2 max-w-[330px] text-[14px] leading-5">{children}</p>}
      </div>
      {actions && <div className="stagger mt-8 flex w-full flex-col gap-3">{actions}</div>}
    </LandingShell>
  );
}
