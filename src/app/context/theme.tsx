"use client";

import { createContext, useCallback, use, useEffect, useSyncExternalStore } from "react";
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

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
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

  const value: ThemeContextType = {
    theme: effectiveTheme,
    isDark: effectiveTheme === "dark",
    isLight: effectiveTheme === "light",
    preference,
    setPreference: writePreference,
    setThemeOverride: (theme) => writePreference(theme ?? "auto"),
  };

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
