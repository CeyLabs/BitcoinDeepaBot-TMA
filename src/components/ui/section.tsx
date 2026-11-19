import { cn } from "cn";

/** Small bold grey heading above a block ("My plan", "Performance"). */
export function SectionLabel({
  className,
  children,
  as: Component = "p",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "p" | "h2" | "label";
}) {
  return (
    <Component className={cn("text-ink2 text-[14px] leading-4 font-bold", className)}>
      {children}
    </Component>
  );
}

/** A labelled block: heading row (with an optional trailing action) and content, 12px apart. */
export function Section({
  title,
  action,
  className,
  children,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {(title || action) && (
        <div className="flex min-h-5 items-center justify-between">
          {title && <SectionLabel>{title}</SectionLabel>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Grouped list on the "detail" grey (sheets, settings): rows separated by hairlines. */
export function List({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-chip overflow-hidden rounded-xl", className)} {...props}>
      {children}
    </div>
  );
}

/** Row inside a <List>: icon tile | title + subtitle | trailing. */
export function ListRow({
  icon,
  title,
  subtitle,
  after,
  className,
  onClick,
  as,
  ...props
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  after?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "div" | "button";
} & Omit<React.HTMLAttributes<HTMLElement>, "title" | "onClick">) {
  const Component = as ?? (onClick ? "button" : "div");
  return (
    <Component
      {...(Component === "button" && { type: "button" as const })}
      onClick={onClick}
      className={cn(
        "relative flex min-h-14 w-full items-center gap-3 border-0 bg-transparent px-3.5 py-3 text-left",
        "after:bg-line after:absolute after:right-0 after:bottom-0 after:left-[62px] after:h-px last:after:hidden",
        Component === "button" && "press",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="bg-card flex size-9 shrink-0 items-center justify-center rounded-[10px] [&_img]:size-[26px] [&_img]:object-contain">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 grow flex-col gap-1">
        <span className="text-foreground text-[15px] leading-[18px] font-semibold">{title}</span>
        {subtitle && <span className="text-ink3 truncate text-[13px] leading-4">{subtitle}</span>}
      </span>
      {after}
    </Component>
  );
}

/** Key/value rows on the detail grey (review and receipt screens). */
export function KeyValueList({
  rows,
  className,
}: {
  rows: { k: React.ReactNode; v: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("bg-chip rounded-xl py-0.5", className)}>
      {rows.map((r, i) => (
        <div
          key={i}
          className="after:bg-line relative flex items-center justify-between gap-3 px-3.5 py-[11px] text-[14px] after:absolute after:right-3.5 after:bottom-0 after:left-3.5 after:h-px last:after:hidden"
        >
          <span className="text-ink2">{r.k}</span>
          <span className="num text-right font-semibold">{r.v}</span>
        </div>
      ))}
    </div>
  );
}
