"use client";

import { useRef } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { cn } from "cn";

const LONG_PRESS_MS = 400;
const TAP_SLOP_PX = 10;

const isTextField = (el: EventTarget | null): el is HTMLInputElement | HTMLTextAreaElement =>
  el instanceof HTMLTextAreaElement ||
  (el instanceof HTMLInputElement && /^(text|search|tel|url|email|password|number)$/.test(el.type));

/**
 * Base UI's keyboard helper turns a tap on a field into blur + focus (so iOS opens the
 * keyboard). On a long press, or on a field that's already focused, that closes the native
 * Paste / selection menu, and in Android's Telegram it keeps reopening and closing. Let those
 * touches end natively instead. A press that moved is a drag and still reaches the sheet.
 */
function useNativeFieldPress() {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  return {
    onTouchStartCapture: (e: React.TouchEvent) => {
      const t = e.touches[0];
      start.current = t ? { x: t.clientX, y: t.clientY, t: e.timeStamp } : null;
    },
    onTouchEndCapture: (e: React.TouchEvent) => {
      const s = start.current;
      start.current = null;
      const t = e.changedTouches[0];
      if (!s || !t || !isTextField(e.target)) return;
      const moved =
        Math.abs(t.clientX - s.x) > TAP_SLOP_PX || Math.abs(t.clientY - s.y) > TAP_SLOP_PX;
      if (moved) return;
      const longPress = e.timeStamp - s.t >= LONG_PRESS_MS;
      if (longPress || document.activeElement === e.target) e.stopPropagation();
    },
  };
}

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
 * The keyboard provider pads the scrolling popup so a focused field stays above the software
 * keyboard. From 640px (web on desktop) it's a centred card instead of a bottom sheet.
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
  const nativeFieldPress = useNativeFieldPress();
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
        <Drawer.VirtualKeyboardProvider>
          <Drawer.Viewport className="fixed inset-0 z-90 flex items-end justify-center min-[640px]:items-center">
            <Drawer.Popup
              {...nativeFieldPress}
              className={cn(
                "bg-card text-foreground flex max-h-[94dvh] w-full max-w-[440px] flex-col overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-[20px] pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] outline-none min-[640px]:max-h-[88dvh] min-[640px]:rounded-[20px]",
                "[transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[480ms] ease-[cubic-bezier(0.2,0.95,0.25,1)] data-swiping:duration-0 data-swiping:select-none",
                "data-ending-style:[transform:translateY(100%)] data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*200ms)] data-ending-style:ease-in data-starting-style:[transform:translateY(100%)]",
                // Centred card: rises in a little and fades, rather than sliding up from the edge.
                "min-[640px]:transition-[transform,opacity] min-[640px]:data-ending-style:[transform:translateY(24px)] min-[640px]:data-ending-style:opacity-0 min-[640px]:data-starting-style:[transform:translateY(40px)_scale(.98)] min-[640px]:data-starting-style:opacity-0",
                // A sheet opened from this one (e.g. Add bank from Settings): shrink to the front
                // sheet's height and tuck behind it, so only a sliver peeks out on top, never this
                // sheet's own content above the front one.
                "group/sheet origin-top data-nested-drawer-open:h-(--drawer-frontmost-height) data-nested-drawer-open:[transform:translateY(-10px)_scale(0.94)] data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-90",
                "*:transition-opacity *:duration-200 data-nested-drawer-open:*:opacity-0",
                flow && "min-h-[min(640px,88dvh)]",
                className
              )}
            >
              <div
                aria-hidden
                className="bg-line mx-auto mb-1 h-[5px] w-9 shrink-0 rounded-[5px]"
              />
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
              {/* Content: a mouse can select text and use fields without dragging the sheet.
                  Touch still swipes from anywhere; a scrolled body scrolls first. Nothing here
                  opts out of swipes: an ignored touch falls through and scrolls the page behind. */}
              <Drawer.Content className="grow pb-2">{children}</Drawer.Content>
              {footer && (
                <div
                  // Pinned to the bottom, except while a field is focused: then the keyboard is
                  // up and a pinned button would sit on the very field being typed in (Base UI
                  // scrolls that field into view). It's then at the end of the form, like CeyFi.
                  className="bg-card sticky bottom-0 z-[4] mt-auto px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] group-has-[input:focus]/sheet:static group-has-[textarea:focus]/sheet:static"
                >
                  {footer}
                </div>
              )}
              {!footer && <div className="h-[env(safe-area-inset-bottom)] shrink-0" />}
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.VirtualKeyboardProvider>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
