"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { usePlatform, type ColorScheme } from "@/platform";

interface ThemeContextType {
  theme: ColorScheme;
  isDark: boolean;
  isLight: boolean;
  /** Dev-only: force a theme regardless of Telegram/OS detection. Pass null to go back to auto. */
  setThemeOverride: (theme: ColorScheme | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
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

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<ColorScheme | null>(null);
  const effectiveTheme = themeOverride ?? scheme;

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
    setThemeOverride,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
