"use client";

import { useEffect, useRef, useState } from "react";
import { haptic } from "@/platform";

/** How far (after resistance) the content must be pulled for a release to refresh. */
export const PULL_THRESHOLD = 60;
const PULL_MAX = 110;
/** Where the spinner rests while the refresh runs. */
const PULL_HOLD = 52;
/** The spinner moves half as far as the finger, so the pull feels elastic. */
const RESIST = 0.5;
/** The spinner shows at least this long (no flash) and at most this long: failed
 *  requests retry with backoff, and their data lands whenever it does. */
const MIN_MS = 500;
const MAX_MS = 4000;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Pull-to-refresh on touch screens: dragging down on `ref`'s element while the
 * page is at the very top, and letting go past the threshold, runs `onRefresh`.
 * Mouse, keyboard and scrolling are untouched; sideways or upward drags are left
 * to the browser. Inside Telegram this relies on vertical swipes being disabled
 * (setupTelegram), or the drag would minimize the Mini App instead.
 */
export function usePullToRefresh<T extends HTMLElement>(onRefresh: () => Promise<unknown>) {
  const ref = useRef<T>(null);
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useRef(onRefresh);
  useEffect(() => {
    refresh.current = onRefresh;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { x: number; y: number } | null = null;
    let pulling = false;
    let dist = 0;
    let busy = false;
    const end = () => {
      start = null;
      pulling = false;
      setDragging(false);
    };
    const onStart = (e: TouchEvent) => {
      if (busy || e.touches.length !== 1 || window.scrollY > 0) return;
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dist = 0;
    };
    const onMove = (e: TouchEvent) => {
      if (!start) return;
      const dx = e.touches[0].clientX - start.x;
      const dy = e.touches[0].clientY - start.y;
      // The first movement decides: down (and more down than sideways) is a pull.
      if (!pulling) {
        if (dy <= 0 || Math.abs(dx) > dy || window.scrollY > 0) {
          start = null;
          return;
        }
        pulling = true;
        setDragging(true);
      }
      // Ours now, so the browser's own pull-to-refresh and rubber band stay out of it.
      if (e.cancelable) e.preventDefault();
      const prev = dist;
      dist = Math.min(PULL_MAX, Math.max(0, dy) * RESIST);
      if (prev < PULL_THRESHOLD && dist >= PULL_THRESHOLD) haptic.impact("light");
      setPull(dist);
    };
    const onEnd = async () => {
      if (!pulling) {
        start = null;
        return;
      }
      end();
      if (dist < PULL_THRESHOLD) return setPull(0);
      busy = true;
      setRefreshing(true);
      setPull(PULL_HOLD);
      try {
        await Promise.all([Promise.race([refresh.current(), wait(MAX_MS)]), wait(MIN_MS)]);
      } finally {
        busy = false;
        setRefreshing(false);
        setPull(0);
      }
    };
    const onCancel = () => {
      if (pulling) {
        end();
        setPull(0);
      }
      start = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    // Not passive: a pull has to be able to cancel the browser's scroll.
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onCancel);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
    };
  }, []);

  return { ref, pull, dragging, refreshing };
}
