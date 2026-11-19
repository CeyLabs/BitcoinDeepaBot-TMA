"use client";

import { SearchField } from "@/components/ui/search-field";
import { haptic } from "@/platform";

export interface ActivitySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
}

/** Search field + the round hide-balances eye button. */
export function ActivitySearchBar({
  value,
  onChange,
  visible,
  onToggleVisible,
}: ActivitySearchBarProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <label htmlFor="activity-search" className="sr-only">
        Search activity
      </label>
      <SearchField id="activity-search" value={value} onChange={(e) => onChange(e.target.value)} />
      <button
        type="button"
        aria-label={visible ? "Hide balances" : "Show balances"}
        aria-pressed={!visible}
        onClick={() => {
          haptic.impact("medium");
          onToggleVisible();
        }}
        className="press bg-card text-foreground shadow-card flex size-11 shrink-0 items-center justify-center rounded-full border-0"
      >
        <svg
          className="size-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {visible ? (
            <>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </>
          ) : (
            <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.9 8.3 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
          )}
        </svg>
      </button>
    </div>
  );
}
