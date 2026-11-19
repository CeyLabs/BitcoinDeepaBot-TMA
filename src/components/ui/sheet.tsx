"use client";

import { Drawer } from "@base-ui/react/drawer";
import { cn } from "cn";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown centered in the header; also the dialog's accessible name. */
  title: React.ReactNode;
  /** Shows a back button on the left (multi-step flows). */
  onBack?: () => void;
  /** Hide the close button (e.g. while a payment is processing). */
  hideClose?: boolean;
  /** Sticky footer (the main action). */
  footer?: React.ReactNode;
  /** Taller sheet for multi-step flows, so steps don't jump in height. */
  flow?: boolean;
  className?: string;
  children: React.ReactNode;
}

const ROUND_BTN =
  "press hit bg-chip text-ink2 m-1 flex size-9 shrink-0 items-center justify-center rounded-full border-0";

/**
 * Bottom sheet: grab bar, back | title | close header, scrolling body, sticky footer.
 *
 * Built on Base UI's Drawer (a Dialog with gestures): swipe down to dismiss, once the body is
 * scrolled to the top. The drawer owns every touch on its viewport, so a drag over a short sheet
 * never scrolls the page or a sheet underneath (a sheet opened from inside another sheet nests).
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  onBack,
  hideClose,
  footer,
  flow,
  className,
  children,
}: SheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next, details) => {
        // No close button means "can't leave right now" (e.g. a payment in flight): no swipe either.
        if (!next && hideClose && details.reason === "swipe") {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-90 bg-(--scrim) opacity-[calc(1-var(--drawer-swipe-progress,0))] backdrop-blur-[4px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0" />
        <Drawer.Viewport className="fixed inset-0 z-90 flex items-end justify-center">
          <Drawer.Popup
            className={cn(
              "bg-card text-foreground flex max-h-[94vh] w-full max-w-[440px] flex-col overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-[20px] pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] outline-none",
              "[transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[480ms] ease-[cubic-bezier(0.2,0.95,0.25,1)] data-swiping:duration-0 data-swiping:select-none",
              "data-ending-style:[transform:translateY(100%)] data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*200ms)] data-ending-style:ease-in data-starting-style:[transform:translateY(100%)]",
              flow && "min-h-[min(640px,88vh)]",
              className
            )}
          >
            <div aria-hidden className="bg-line mx-auto mb-1 h-[5px] w-9 shrink-0 rounded-[5px]" />
            <div className="flex min-h-12 shrink-0 items-center gap-1 px-2">
              {onBack ? (
                <button type="button" aria-label="Back" onClick={onBack} className={ROUND_BTN}>
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              ) : (
                <span className="w-11 shrink-0" />
              )}
              <Drawer.Title className="grow truncate text-center font-sans text-[17px] font-bold tracking-normal">
                {title}
              </Drawer.Title>
              {hideClose ? (
                <span className="w-11 shrink-0" />
              ) : (
                <Drawer.Close aria-label="Close" className={ROUND_BTN}>
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Drawer.Close>
              )}
            </div>
            <div className="grow pb-2">{children}</div>
            {footer && (
              <div className="bg-card sticky bottom-0 z-[4] mt-auto px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
                {footer}
              </div>
            )}
            {!footer && <div className="h-[env(safe-area-inset-bottom)] shrink-0" />}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** Progress steps under a flow sheet's header ("Amount · Review · Pay"). */
export function SheetStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div aria-hidden className="flex gap-1.5 px-4 pt-0.5 pb-3">
      {steps.map((label, i) => (
        <span
          key={label}
          className={cn(
            "flex flex-1 flex-col gap-[5px] text-center text-[12px] font-semibold",
            i === current ? "text-foreground" : "text-ink3"
          )}
        >
          <i className="bg-chip relative block h-1 overflow-hidden rounded">
            <span
              className={cn(
                "bg-yaka absolute inset-0 origin-left transition-transform duration-500 ease-(--ease-out-soft)",
                i <= current ? "scale-x-100" : "scale-x-0"
              )}
            />
          </i>
          {label}
        </span>
      ))}
    </div>
  );
}
