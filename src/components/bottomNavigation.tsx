"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { Activity, Newspaper, Star, Wallet } from "lucide-react";
import { haptic } from "@/platform";

/*
 * The floating tab bar, after CeyFi's (ceyfi-web-fe components/layout/nav.tsx): a glass pill of fixed-width icon
 * tabs, the tapped tab's label opening under its icon, and a selection that a hold or a sideways drag lifts into a
 * lens (as iOS 26's tab bar does, after Glisse, github.com/0kzh/glisse, MIT) and carries across the bar.
 */

const TABS = [
  { href: "/dashboard", label: "Wallet", Icon: Wallet },
  { href: "/dashboard/activity", label: "Activity", Icon: Activity },
  { href: "/dashboard/plans", label: "Plans", Icon: Star },
  { href: "/dashboard/news", label: "News", Icon: Newspaper },
] as const;

// "/dashboard" is a prefix of every other tab, so it only matches exactly; nested routes
// (e.g. /dashboard/news/[id]) still light their parent tab.
const tabIndex = (path: string) => {
  const i = TABS.findIndex((t, n) =>
    n === 0 ? path === t.href : path === t.href || path.startsWith(`${t.href}/`)
  );
  return i < 0 ? 0 : i;
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A tab's (and the selection's) corners: 16px, except the bar's outer sides, which stay fully round (half the 56px
 * height) so the first and last selections follow the bar's own curved ends: squared-off in the middle, round only
 * where it meets the bar's ends.
 */
function tabRadius(i: number, count: number) {
  if (i === 0) return "28px 16px 16px 28px";
  if (i === count - 1) return "16px 28px 28px 16px";
  return "16px";
}

/** How far the icon rises (px) when its label opens under it: the 56px tab, centring a 21px icon over the label. */
const LABEL_LIFT = 7;
/** The end tabs' 3px inward nudge, toward the selection's visual middle (its outer side is rounder). */
const nudge = (i: number) => (i === 0 ? 3 : i === TABS.length - 1 ? -3 : 0);

// Same spring the selection uses, so the label and the selection move as one.
const SPRING = "cubic-bezier(.3,1.25,.4,1)";

/** How much bigger than a tab the lifted lens is, in px. */
const GROW_X = 24;
const GROW_Y = 16;
/** Past this many px sideways a press becomes a drag. */
const DRAG_SLOP = 6;
/** A press held this long (ms) lifts the lens; anything shorter is a plain tap. */
const HOLD_MS = 200;

type Motion = "rest" | "drag" | "none";

/**
 * Writes the lens's place and lift straight onto the selection element (no React render per move). Every move is a
 * CSS transition on `translate` / `scale` (see .tab-lens in theme.css), so it runs on the compositor and keeps its
 * frame rate while the main thread renders the page a tap goes to.
 */
function createLens() {
  const at = { i: 0, x: 0, up: false, w: 64, h: 56 };
  let el: HTMLElement | null = null;
  const paint = (motion: Motion) => {
    if (!el) return;
    el.dataset.motion = motion;
    el.style.translate = `${at.x}px 0`;
    el.style.scale = at.up ? `${1 + GROW_X / at.w} ${1 + GROW_Y / at.h}` : "1";
    // The corners belong to the tab the lens is heading for, set with the place so they can't disagree on quick taps.
    el.style.borderRadius = tabRadius(at.i, TABS.length);
  };
  return {
    /** Sends the lens to tab `i`'s shape at `to` (px from the bar's left edge), lifted or at rest. */
    aim(i: number, to: number, up: boolean, dragging = false, instant = false) {
      at.i = i;
      at.x = to;
      at.up = up;
      paint(instant ? "none" : dragging ? "drag" : "rest");
    },
    attach(node: HTMLElement | null) {
      el = node;
    },
    size(w: number, h: number) {
      at.w = w;
      at.h = h;
      if (el) el.style.width = `${w}px`;
    },
  };
}

/** Runs `fn` after two frames: past the commit and the scroll reset a route change does. */
function afterPaint(fn: () => void) {
  let inner = 0;
  const outer = requestAnimationFrame(() => {
    inner = requestAnimationFrame(fn);
  });
  return () => {
    cancelAnimationFrame(outer);
    cancelAnimationFrame(inner);
  };
}

// Fixed bottom pill; hidden on pushed pages (buy, sell, send…) by the layout.
export default function BottomNavigation() {
  const path = usePathname();
  const realIdx = tabIndex(path);
  // Optimistic index: moves on tap and stays there until the route lands (or another tab is chosen). No timed
  // snap-back: on a slow connection the page can take seconds, and a selection that went back and then forward
  // again once the page arrived read as a bug.
  const [idx, setIdx] = useState(realIdx);
  // The tab whose label is showing. Tapping reveals it; anything off the bar hides it.
  const [shown, setShown] = useState<number | null>(null);
  // Smaller while scrolling down (more of the page shows), full size again on scrolling up or near the top.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const dy = y - last;
        // A few pixels of slack so a jittery finger or iOS's bounce doesn't flip it back and forth
        if (y < 40) setCompact(false);
        else if (dy > 6) setCompact(true);
        else if (dy < -6) setCompact(false);
        else return;
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const navRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [lens] = useState(createLens);
  const attachLens = useCallback((node: HTMLSpanElement | null) => lens.attach(node), [lens]);
  // Lifted while a finger (or the mouse) is down on the bar; `over` is the tab under the lens then, which takes the ink.
  const [lifted, setLifted] = useState(false);
  const [over, setOver] = useState<number | null>(null);
  const pressing = useRef(false);
  const placed = useRef(false);
  const router = useRouter();

  // The tabs chosen since the last page landed, oldest first; the last is the one on its way.
  const [chosen, setChosen] = useState<number[]>([]);
  // When the route actually changes, accept the real index, during render rather than in an effect. Except an
  // outdated tap: tap Activity then Plans quickly and Activity's page can land first; a page for a tab chosen
  // earlier and then replaced is passed over, anything else (back, a redirect) is accepted.
  const [prevReal, setPrevReal] = useState(realIdx);
  if (prevReal !== realIdx) {
    setPrevReal(realIdx);
    const latest = chosen.at(-1);
    const outdated = latest !== undefined && realIdx !== latest && chosen.includes(realIdx);
    if (!outdated) {
      setChosen([]);
      setIdx(realIdx);
    }
  }

  // The lens springs to the measured tab, landing there at once the first time. ResizeObserver catches the 380px
  // breakpoint.
  useLayoutEffect(() => {
    const el = tabRefs.current[idx];
    if (!el) return;
    const place = () => {
      lens.size(el.offsetWidth, el.offsetHeight);
      if (!pressing.current) lens.aim(idx, el.offsetLeft, false, false, !placed.current);
      placed.current = true;
    };
    place();
    const ro = new ResizeObserver(place);
    tabRefs.current.forEach((tab) => tab && ro.observe(tab));
    return () => ro.disconnect();
  }, [idx, lens]);

  /** What a tap on tab `i` does, and a drag that lets go over it. */
  const select = (i: number) => {
    setShown(i);
    if (!reducedMotion()) haptic.select();
    setIdx(i);
    // Coming back to the page already showing changes nothing, unless another tab is still on its way.
    setChosen((c) => (i === realIdx && c.length === 0 ? c : [...c.filter((x) => x !== i), i]));
  };
  const dropOn = useEffectEvent((i: number) => {
    const pending = idx !== realIdx;
    select(i);
    if (i !== realIdx || pending) router.push(TABS[i].href);
  });
  const currentIdx = useEffectEvent(() => idx);

  // Press, drag and release on the bar. A tap still goes through the link's own click; only a hold or a drag
  // selects here, and then the click it would leave behind is swallowed.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    type Gesture = {
      id: number;
      i: number;
      x: number;
      anchor: number;
      up: boolean;
      moved: boolean;
      scale: number;
      first: number;
      slot: number;
      left: number;
      width: number;
    };
    let g: Gesture | null = null;
    let under = -1;
    let swallowUntil = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;

    const settle = (i: number) => {
      const el = tabRefs.current[i];
      if (el) lens.aim(i, el.offsetLeft, false);
    };
    const hover = (i: number) => {
      if (i === under) return;
      // A tick per tab crossed while dragging
      if (under >= 0 && g?.moved) haptic.select();
      under = i;
      setOver(i);
    };
    // Where the finger has carried the lens, in the bar's own px: the bar may be scaled down (compact) on screen.
    const position = (gs: Gesture, e: PointerEvent) =>
      Math.min(
        gs.first + gs.slot * (TABS.length - 1),
        Math.max(gs.first, gs.anchor + (e.clientX - gs.x) / gs.scale)
      );
    const indexAt = (gs: Gesture, x: number) => Math.round((x - gs.first) / gs.slot);
    const glow = (gs: Gesture, clientX: number) => {
      const light = glowRef.current;
      if (light)
        light.style.translate = `${Math.min(gs.width, Math.max(0, (clientX - gs.left) / gs.scale))}px 0`;
    };
    const lift = (gs: Gesture, clientX: number) => {
      if (gs.up) return;
      gs.up = true;
      pressing.current = true;
      glow(gs, clientX);
      setLifted(true);
      hover(gs.i);
      lens.aim(gs.i, gs.anchor, true);
    };
    const release = () => {
      const old = g;
      g = null;
      clearTimeout(hold);
      if (!old?.up) return old;
      under = -1;
      pressing.current = false;
      setLifted(false);
      setOver(null);
      if (nav.hasPointerCapture(old.id)) nav.releasePointerCapture(old.id);
      return old;
    };

    const onDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0 || g || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const tab = (e.target as Element).closest("a");
      const tabs = tabRefs.current;
      const i = tabs.indexOf(tab as HTMLAnchorElement);
      if (i < 0 || !tab || !tabs[0] || !tabs[1]) return;
      const first = tabs[0].offsetLeft;
      const box = nav.getBoundingClientRect();
      const gs: Gesture = {
        id: e.pointerId,
        i,
        x: e.clientX,
        anchor: tab.offsetLeft,
        up: false,
        moved: false,
        scale: box.width / nav.offsetWidth || 1,
        first,
        slot: tabs[1].offsetLeft - first,
        left: box.left,
        width: nav.offsetWidth,
      };
      g = gs;
      hold = setTimeout(() => g === gs && lift(gs, gs.x), HOLD_MS);
    };
    const onMove = (e: PointerEvent) => {
      if (!g || e.pointerId !== g.id) return;
      if (!g.moved && Math.abs(e.clientX - g.x) > DRAG_SLOP) {
        g.moved = true;
        lift(g, e.clientX);
        nav.setPointerCapture(e.pointerId);
      }
      if (g.up) glow(g, e.clientX);
      if (!g.moved) return;
      const x = position(g, e);
      const at = indexAt(g, x);
      lens.aim(at, x, true, true);
      hover(at);
    };
    const onEnd = (e: PointerEvent) => {
      if (!g || e.pointerId !== g.id) return;
      const gs = g;
      const i = indexAt(gs, gs.moved ? position(gs, e) : gs.anchor);
      release();
      // A plain tap: the link's click does the rest.
      if (!gs.up) return;
      if (e.type !== "pointerup") {
        // Cancelled (the page took the touch to scroll, a context menu, the pointer lost): back where it was.
        settle(currentIdx());
        return;
      }
      // Held or dragged: the bar chooses the tab itself (Android sends no click after a long press), and swallows
      // the click a shorter hold still leaves behind.
      swallowUntil = performance.now() + 500;
      settle(i);
      dropOn(i);
    };
    // Once the lens is up, the finger belongs to the bar, not the page's scroll.
    const onTouchMove = (e: TouchEvent) => {
      if (g?.up && e.cancelable) e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      if (performance.now() < swallowUntil) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    // Only the bar's own capture ending counts: taking the capture over from the tab fires lostpointercapture on
    // the tab, which bubbles here.
    const onLostCapture = (e: PointerEvent) => {
      if (e.target === nav) onEnd(e);
    };
    const onContextMenu = (e: Event) => e.preventDefault();
    const reset = () => {
      if (!g) return;
      release();
      settle(currentIdx());
    };
    const onVisibility = () => document.hidden && reset();

    nav.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    nav.addEventListener("lostpointercapture", onLostCapture);
    nav.addEventListener("touchmove", onTouchMove, { passive: false });
    nav.addEventListener("click", onClick, true);
    nav.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", reset);
    return () => {
      clearTimeout(hold);
      nav.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      nav.removeEventListener("lostpointercapture", onLostCapture);
      nav.removeEventListener("touchmove", onTouchMove);
      nav.removeEventListener("click", onClick, true);
      nav.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", reset);
    };
  }, [lens]);

  // Hide the label on the first thing the user does that isn't on the tab bar.
  useEffect(() => {
    if (shown === null) return;
    const hide = () => setShown(null);
    const offBar = (e: Event) => {
      if (!navRef.current?.contains(e.target as Node)) hide();
    };
    let detach = () => {};
    const attach = () => {
      const opts = { capture: true, passive: true } as const;
      // Scroll doesn't bubble: capture catches sheets and lists as well as the page.
      window.addEventListener("scroll", hide, opts);
      window.addEventListener("wheel", offBar, opts);
      window.addEventListener("touchmove", offBar, opts);
      document.addEventListener("pointerdown", offBar, true);
      document.addEventListener("keydown", hide, true);
      detach = () => {
        window.removeEventListener("scroll", hide, opts);
        window.removeEventListener("wheel", offBar, opts);
        window.removeEventListener("touchmove", offBar, opts);
        document.removeEventListener("pointerdown", offBar, true);
        document.removeEventListener("keydown", hide, true);
      };
    };
    // Wait for the tapped route to land, or its scroll reset would hide the label at once.
    let cancel: () => void;
    if (realIdx === shown) {
      cancel = afterPaint(attach);
    } else {
      const fallback = setTimeout(attach, 2000);
      cancel = () => clearTimeout(fallback);
    }
    return () => {
      cancel();
      detach();
    };
  }, [shown, realIdx]);

  return (
    <nav
      ref={navRef}
      // Tabs are 64px (56px under 380px) whether or not their label shows: it opens under the icon, so the bar never
      // changes width. w-max + translateX(-50%): the bar's own content width, centred on the screen.
      // touch-pan-y: a sideways drag stays with the bar; an upward one still scrolls the page.
      className="animate-nav-in glass fixed bottom-(--nav-bottom) left-[50vw] z-40 flex w-max origin-bottom touch-pan-y rounded-full p-[5px] select-none [--tab:64px] [-webkit-touch-callout:none] max-[380px]:[--tab:56px]"
      // Shrinks toward its bottom edge, so it stays the same distance from the bottom of the screen. The centring
      // and the shrink are the individual `translate` / `scale` properties, not `transform`: the entry animation
      // (animate-nav-in) owns `transform` and keeps its last frame, so a transform here would never apply.
      style={{
        translate: "-50% 0",
        scale: compact ? 0.84 : 1,
        transition: `scale 450ms ${SPRING}`,
      }}
      data-lifted={lifted || undefined}
      aria-label="Main"
    >
      {/* The light under a held finger: nothing until the lens lifts; the press handlers move the inner span. */}
      <span className="tab-glow" aria-hidden="true">
        <span ref={glowRef} />
      </span>
      {/* The selection / lens. Its translate and scale are written by createLens; the starting translate (the first
          tab) only shows until the first layout pass places it. */}
      <span
        ref={attachLens}
        className="tab-lens pointer-events-none absolute top-[5px] left-0 h-[56px] w-(--tab)"
        style={{ translate: "5px 0", borderRadius: tabRadius(0, TABS.length) }}
        aria-hidden="true"
      />
      {TABS.map((tab, i) => {
        const open = shown === i;
        return (
          <Link
            key={tab.href}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            href={tab.href}
            onClick={(e) => {
              // Cmd/Ctrl/Shift/Alt-click opens the tab elsewhere; this page stays, so the selection does too.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              select(i);
            }}
            // A mouse drag across the bar moves the lens; without this it would pick the link up instead.
            draggable={false}
            className={cn(
              "press relative flex h-[56px] w-(--tab) flex-col items-center justify-center px-1 text-[11px] leading-none font-semibold no-underline transition-colors duration-300",
              i === (over ?? idx) ? "text-(--glass-ink)" : "text-(--glass-fg)"
            )}
            style={{ borderRadius: tabRadius(i, TABS.length) }}
            aria-label={tab.label}
            aria-current={i === realIdx ? "page" : undefined}
          >
            {/* With the label open the icon rises LABEL_LIFT px to make room for it. */}
            <span
              className="relative flex"
              style={{
                translate: `${nudge(i)}px ${open ? -LABEL_LIFT : 0}px`,
                transition: `translate 400ms ${SPRING}`,
              }}
            >
              <tab.Icon size={21} strokeWidth={2} aria-hidden="true" />
            </span>
            {/* Under the icon, out of the flow (so the icon stays centred), faded and slid into place: opacity and
                translate run on the compositor, so the text doesn't stutter in while the tapped page renders. */}
            <span
              className="pointer-events-none absolute inset-x-0 top-[35px] px-1"
              style={{
                translate: `${nudge(i)}px ${open ? 0 : 4}px`,
                opacity: open ? 1 : 0,
                transition: `translate 400ms ${SPRING}, opacity 250ms ease ${open ? "80ms" : "0ms"}`,
              }}
              aria-hidden="true"
            >
              <span className="block truncate text-center whitespace-nowrap max-[380px]:text-[10px]">
                {tab.label}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
