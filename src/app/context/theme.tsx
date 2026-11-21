"use client";

import { createContext, useCallback, use, useEffect, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { usePlatform, type ColorScheme } from "@/platform";
import { THEME_PREFERENCE_KEY } from "@/lib/theme-boot";

/** The Appearance setting: follow Telegram/OS, or force one scheme. */
export type ThemePreference = "auto" | ColorScheme;

interface ThemeContextType {
  theme: ColorScheme;
  isDark: boolean;
  isLight: boolean;
  /** The saved Appearance setting ("auto" follows Telegram/OS). */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Same as setPreference; null goes back to auto. */
  setThemeOverride: (theme: ColorScheme | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

/** The page's background (body) as #rrggbb, or null if it can't be read. */
function readPageColor(): string | null {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(document.body).backgroundColor);
  if (!m) return null;
  return `#${m
    .slice(1, 4)
    .map((n) => Number(n).toString(16).padStart(2, "0"))
    .join("")}`;
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Light/dark only — colors always come from our own palette (styles/theme.css).
 * Inside Telegram this follows the Telegram client; everywhere else (browser,
 * installed PWA, or while detection is still running) it follows the OS.
 */
function useColorScheme(): ColorScheme {
  const platform = usePlatform();

  const subscribe = useCallback(
    (onChange: () => void) => {
      const unsubscribe = platform.onColorSchemeChange(onChange);
      if (unsubscribe) return unsubscribe;
      const mediaQuery = window.matchMedia(DARK_QUERY);
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    [platform]
  );

  const getSnapshot = (): ColorScheme =>
    platform.getColorScheme() ?? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light");

  // The server can't know the scheme. Colors don't depend on this value —
  // they follow <html data-theme>, set before paint by THEME_BOOT_SCRIPT — so
  // a fixed server snapshot only affects JS consumers (e.g. chart colors),
  // which update right after hydration.
  return useSyncExternalStore(subscribe, getSnapshot, () => "light");
}

// ─── Saved Appearance setting (localStorage, shared across tabs) ─────────────

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_PREFERENCE_KEY);
    return saved === "light" || saved === "dark" ? saved : "auto";
  } catch {
    return "auto";
  }
}

let preferenceCache: ThemePreference | null = null;

function subscribePreference(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_PREFERENCE_KEY) return;
    preferenceCache = readPreference();
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getPreference(): ThemePreference {
  if (preferenceCache === null) preferenceCache = readPreference();
  return preferenceCache;
}

function writePreference(next: ThemePreference) {
  preferenceCache = next;
  try {
    if (next === "auto") localStorage.removeItem(THEME_PREFERENCE_KEY);
    else localStorage.setItem(THEME_PREFERENCE_KEY, next);
  } catch {
    // Storage blocked: keep it for this session only.
  }
  listeners.forEach((notify) => notify());
}

// Where the last tap was: a theme switch spreads out from there.
let lastTap: { x: number; y: number } | null = null;
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e) => {
      lastTap = { x: e.clientX, y: e.clientY };
    },
    { capture: true, passive: true }
  );
}

const SPREAD_MS = 750;

/**
 * Switch light/dark with the new theme spreading out in a circle from the
 * tap (View Transitions: the old page is a still snapshot, the new one is
 * revealed by a growing clip-path). Browsers without the API, and reduced
 * motion, switch at once.
 */
function switchTheme(next: ColorScheme, apply: () => void) {
  const root = document.documentElement;
  const canAnimate =
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canAnimate) {
    apply();
    return;
  }
  const { x, y } = lastTap ?? { x: window.innerWidth / 2, y: 0 };
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  // No colour transitions inside the new snapshot: it should already be the new theme.
  root.classList.add("theme-switching");
  const transition = document.startViewTransition(() => {
    flushSync(apply);
    root.dataset.theme = next;
    root.style.colorScheme = next;
  });
  transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: SPREAD_MS,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    )
    .catch(() => {});
  transition.finished.finally(() => root.classList.remove("theme-switching"));
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const platform = usePlatform();
  const pathname = usePathname();
  const scheme = useColorScheme();
  const preference = useSyncExternalStore<ThemePreference>(
    subscribePreference,
    getPreference,
    () => "auto"
  );
  const effectiveTheme = preference === "auto" ? scheme : preference;

  // Keep <html data-theme> (which drives every color token and the `dark:`
  // variant) in sync with the live scheme after the boot script's first guess.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = effectiveTheme;
    root.style.colorScheme = effectiveTheme;
  }, [effectiveTheme]);

  // Status bar / Telegram header and bottom bar in the page's colour. Read
  // from the page itself (after the frame that applies the theme and the
  // route's surface, e.g. the landing's card colour) rather than hard-coded,
  // so they can never drift apart.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const color = readPageColor();
      if (color) platform.setChromeColor(color);
    });
    return () => cancelAnimationFrame(frame);
  }, [effectiveTheme, pathname, platform]);

  const setPreference = (next: ThemePreference) => {
    const nextTheme = next === "auto" ? scheme : next;
    if (nextTheme === effectiveTheme) writePreference(next);
    else switchTheme(nextTheme, () => writePreference(next));
  };

  const value: ThemeContextType = {
    theme: effectiveTheme,
    isDark: effectiveTheme === "dark",
    isLight: effectiveTheme === "light",
    preference,
    setPreference,
    setThemeOverride: (theme) => setPreference(theme ?? "auto"),
  };

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
