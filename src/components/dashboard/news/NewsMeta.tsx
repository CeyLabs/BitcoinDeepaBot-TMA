import { cn } from "cn";

/** "5 min read · Category" line with the design's dot separator. */
export function NewsMeta({ parts, className }: { parts: React.ReactNode[]; className?: string }) {
  return (
    <span className={cn("text-ink3 flex min-w-0 items-center gap-1.5 text-[12px]", className)}>
      {parts.map((part, i) => (
        <span key={i} className="contents">
          {i > 0 && (
            <span aria-hidden className="size-1 shrink-0 rounded-full bg-current opacity-60" />
          )}
          <span className={i === parts.length - 1 ? "truncate" : "shrink-0"}>{part}</span>
        </span>
      ))}
    </span>
  );
}
