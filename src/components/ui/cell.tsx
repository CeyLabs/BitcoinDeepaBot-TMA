import { cn } from "cn";

interface CellProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Leading content, usually an emoji image (36px) or icon. */
  before?: React.ReactNode;
  /** Trailing content, e.g. a badge or <CellChevron />. */
  after?: React.ReactNode;
  /** Secondary line under the title. */
  subtitle?: React.ReactNode;
  /** Element to render ("button" when the whole row is clickable). */
  as?: "div" | "button" | "li";
  disabled?: boolean;
}

/**
 * Card row: before | title + subtitle | after. Raised card by default; pass
 * `className="shadow-none bg-transparent"` for rows inside a grouped list.
 */
export function Cell({
  before,
  after,
  subtitle,
  children,
  className,
  as: Component = "div",
  ref,
  ...props
}: CellProps & { ref?: React.Ref<HTMLElement> }) {
  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(
        "bg-card shadow-card relative flex min-h-16 w-full items-center gap-3 rounded-xl px-4 py-3 text-left",
        Component === "button" && "press",
        className
      )}
      // A clickable row must not submit a form it ends up in.
      {...(Component === "button" && { type: "button" })}
      {...props}
    >
      {before && <div className="flex shrink-0 items-center justify-center">{before}</div>}
      <div className="flex min-w-0 grow flex-col gap-1 pl-0.5">
        {children !== undefined && children !== null && (
          <div className="text-foreground truncate text-[16px] leading-[18px] font-semibold">
            {children}
          </div>
        )}
        {subtitle && <div className="text-ink3 truncate text-[13px] leading-4">{subtitle}</div>}
      </div>
      {after && <div className="flex shrink-0 items-center gap-2">{after}</div>}
    </Component>
  );
}

/** Trailing ">" for navigable rows. */
export function CellChevron({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("text-ink3 shrink-0", className)}
    >
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
