"use client";

import { cn } from "cn";
import { haptic } from "@/platform";
import { useSheets } from "@/components/dashboard/sheets";

const ICONS = {
  buy: <path d="M12 5v14M19 12l-7 7-7-7" />,
  sell: <path d="M12 19V5M5 12l7-7 7 7" />,
  send: (
    <>
      <path d="M20.5 4.5L4 11l4.6 1.7 1.4 5.3 2.6-3 4.3 3.1z" />
      <path d="M8.6 12.7l7.9-5.2" />
    </>
  ),
  request: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
};

/** Buy / Sell / Send / Request tiles under the Total value card. */
export function QuickActions() {
  const { openTrade, openSend } = useSheets();

  return (
    <div role="group" aria-label="Quick actions" className="-mt-2 grid grid-cols-4 gap-2">
      <Action
        icon={ICONS.buy}
        label="Buy"
        onClick={() => {
          haptic.impact("light");
          openTrade("buy");
        }}
      />
      <Action
        icon={ICONS.sell}
        label="Sell"
        onClick={() => {
          haptic.impact("light");
          openTrade("sell");
        }}
      />
      <Action
        icon={ICONS.send}
        label="Send"
        onClick={() => {
          haptic.impact("light");
          openSend();
        }}
      />
      {/* No backend for requesting sats yet. */}
      <Action icon={ICONS.request} label="Request" soon />
    </div>
  );
}

function Action({
  icon,
  label,
  onClick,
  soon,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  soon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={soon}
      aria-label={soon ? `${label}, coming soon` : undefined}
      className={cn(
        "press bg-tile relative flex h-[55px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border-0 px-1 py-1.5 text-[11px] leading-[13px] font-medium",
        soon ? "text-on-disabled" : "text-on-tile"
      )}
    >
      {soon && (
        <span
          aria-hidden
          className="text-link absolute top-[5px] right-[5px] rounded-lg bg-[rgba(248,147,26,0.16)] px-[5px] py-0.5 text-[8px] leading-[10px] font-bold tracking-[0.02em] uppercase dark:bg-[rgba(248,147,26,0.18)]"
        >
          Soon
        </span>
      )}
      <svg
        className={cn("size-7", soon && "opacity-55")}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {icon}
      </svg>
      <span className="block w-full text-center">{label}</span>
    </button>
  );
}
