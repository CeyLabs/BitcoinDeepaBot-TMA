import { cn } from "cn";

/** "🕒 5 min read · CATEGORY · date" line under a news title. */
export function NewsMeta({ parts, className }: { parts: React.ReactNode[]; className?: string }) {
  return (
    <span
      className={cn(
        "text-ink3 flex min-w-0 items-center gap-1.5 text-[13px] leading-4 font-medium",
        className
      )}
    >
      <svg
        className="size-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      {parts.map((part, i) => (
        <span key={i} className="contents">
          {i > 0 && <span aria-hidden>·</span>}
          <span className={i === parts.length - 1 ? "truncate" : "shrink-0"}>{part}</span>
        </span>
      ))}
    </span>
  );
}
