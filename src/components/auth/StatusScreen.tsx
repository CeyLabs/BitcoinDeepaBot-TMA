import Image from "next/image";
import { cn } from "cn";

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

/** Large (88px) animated emoji for status screens, the size the result screens use. */
export function BigEmoji({ src, className }: { src: string; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={88}
      height={88}
      unoptimized
      priority
      className={cn("mx-auto size-[88px] object-contain", className)}
    />
  );
}

/**
 * Full-screen shell for results outside the dashboard (payment results, errors,
 * 404): app background, content centred, actions pinned at the bottom above the
 * home indicator. The top inset comes from the body (standalone PWA only). The same layout as the Buy/Sell/Send result screens.
 */
export function ResultShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background text-foreground min-h-app mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-6 pb-[calc(24px+env(safe-area-inset-bottom))]">
      {children}
    </main>
  );
}

/** Art, title and message, centred: the top half of every result screen. */
export function StatusBody({
  art,
  title,
  children,
}: {
  art: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="stagger flex flex-1 flex-col items-center justify-center text-center">
      {art}
      <h1 className="mt-3 text-[22px] leading-7">{title}</h1>
      {children && (
        <p className="text-ink2 mt-1 max-w-sm px-2 text-[14px] leading-5 font-semibold">
          {children}
        </p>
      )}
    </div>
  );
}

/** Result screen actions: full width, at the bottom. */
export function StatusActions({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full flex-col gap-2">{children}</div>;
}

/**
 * Result screen: an emoji (or <SuccessCheck />), title, message, and actions
 * at the bottom. Used by the error, not-found and payment result pages.
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
    <ResultShell>
      <StatusBody art={art} title={title}>
        {children}
      </StatusBody>
      {actions && <StatusActions>{actions}</StatusActions>}
    </ResultShell>
  );
}
