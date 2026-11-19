"use client";

import { useEffect } from "react";

/*
 * Stops a swipe from counting as a tap on iOS, mounted once in Providers. Ported from CeyFi.
 *
 * WebKit synthesises a `click` on release whenever a touch sequence was not consumed by a native
 * gesture, however far the finger travelled. Anything that calls `preventDefault()` on `touchmove`
 * takes the gesture away from the native scroller and so gets that click: Base UI's Drawer sheets
 * and our pull-to-refresh both do. Chrome and Android never synthesise it, so this only
 * matters on iOS, but the guard is harmless elsewhere: it just never fires.
 *
 * A finger that moves past the slop before lifting arms the guard for the one click that follows.
 * A new touch disarms it, so a real tap right after a swipe is unaffected. Mouse clicks never arm it.
 * Touch and pointer events are both watched, since a native control may deliver only one of them.
 * The click is cancelled in the capture phase on `window`, ahead of any React handler.
 */

/** Past this many px the finger was dragging, not tapping (WebKit's own tap tolerance is about the same). */
const SLOP = 10;
/** The synthesised click arrives right after release; anything later is a new interaction. */
const WINDOW_MS = 600;

export function SwipeClickGuard() {
  useEffect(() => {
    let start: { x: number; y: number } | null = null;
    let moved = false;
    let armedUntil = 0;

    const begin = (x: number, y: number) => {
      armedUntil = 0;
      start = { x, y };
      moved = false;
    };
    const move = (x: number, y: number) => {
      if (start && !moved && Math.hypot(x - start.x, y - start.y) > SLOP) moved = true;
    };
    const release = () => {
      if (start && moved) armedUntil = performance.now() + WINDOW_MS;
      start = null;
      moved = false;
    };
    const cancel = () => {
      start = null;
      moved = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return cancel();
      begin(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      move(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      if (!start) begin(e.clientX, e.clientY);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      move(e.clientX, e.clientY);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      release();
    };
    const onClick = (e: MouseEvent) => {
      // Keyboard, assistive-tech and programmatic clicks have detail 0; only a tap is synthesised.
      if (!armedUntil || e.detail === 0) return;
      const armed = performance.now() < armedUntil;
      armedUntil = 0;
      if (!armed) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    const opts: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener("touchstart", onTouchStart, opts);
    window.addEventListener("touchmove", onTouchMove, opts);
    window.addEventListener("touchend", release, opts);
    window.addEventListener("touchcancel", cancel, opts);
    window.addEventListener("pointerdown", onPointerDown, opts);
    window.addEventListener("pointermove", onPointerMove, opts);
    window.addEventListener("pointerup", onPointerUp, opts);
    window.addEventListener("pointercancel", cancel, opts);
    window.addEventListener("click", onClick, true);
    // Lets a device check that this build carries the guard (Web Inspector: html[data-swipe-guard]).
    document.documentElement.dataset.swipeGuard = "1";
    return () => {
      window.removeEventListener("touchstart", onTouchStart, opts);
      window.removeEventListener("touchmove", onTouchMove, opts);
      window.removeEventListener("touchend", release, opts);
      window.removeEventListener("touchcancel", cancel, opts);
      window.removeEventListener("pointerdown", onPointerDown, opts);
      window.removeEventListener("pointermove", onPointerMove, opts);
      window.removeEventListener("pointerup", onPointerUp, opts);
      window.removeEventListener("pointercancel", cancel, opts);
      window.removeEventListener("click", onClick, true);
      delete document.documentElement.dataset.swipeGuard;
    };
  }, []);
  return null;
}
