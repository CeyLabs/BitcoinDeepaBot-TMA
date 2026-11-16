import { cn } from "cn";

interface CellProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Leading content, usually an icon or image. */
  before?: React.ReactNode;
  /** Trailing content, e.g. a badge or <CellChevron />. */
  after?: React.ReactNode;
  /** Secondary line under the title. */
  subtitle?: React.ReactNode;
  /** Element to render (e.g. "button" when the whole row is clickable). */
  as?: "div" | "button" | "li";
}

/**
 * List row: before | title + subtitle | after. Vertical padding of the middle
 * column defaults to 16px; override with `[--cell-py:12px]` in className.
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
        "flex w-full items-center gap-6 px-6 text-left [--cell-py:16px]",
        Component === "button" && "hover:bg-tertiary cursor-pointer",
        className
      )}
      // A clickable row must not submit a form it ends up in.
      {...(Component === "button" && { type: "button" })}
      {...props}
    >
      {before && <div className="flex shrink-0 items-center justify-center">{before}</div>}
      <div className="flex min-w-0 grow flex-col gap-0.5 py-(--cell-py)">
        {children !== undefined && children !== null && (
          <div className="truncate text-[16px] leading-6">{children}</div>
        )}
        {subtitle && (
          <div className="text-hint truncate text-[15px] leading-[22px]">{subtitle}</div>
        )}
      </div>
      {after && <div className="flex shrink-0 items-center justify-center">{after}</div>}
    </Component>
  );
}

/** Trailing ">" for navigable rows. */
export function CellChevron({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cn("text-hint shrink-0", className)}
    >
      <path
        d="m6 3 5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
