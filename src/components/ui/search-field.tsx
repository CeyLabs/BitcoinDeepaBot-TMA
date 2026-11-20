"use client";

import { cn } from "cn";

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/** Search input on a raised card, with a leading magnifier. */
export function SearchField({
  className,
  placeholder = "Search",
  ref,
  ...props
}: SearchFieldProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <div className={cn("relative grow", className)}>
      <svg
        className="text-ink3 pointer-events-none absolute top-[11px] left-3 size-[22px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className="bg-card text-foreground shadow-card placeholder:text-ink3 h-11 w-full rounded-xl border-0 pr-3.5 pl-[42px] text-[16px] font-semibold outline-none focus:shadow-[0_0_0_2px_var(--ring)]"
        {...props}
      />
    </div>
  );
}
