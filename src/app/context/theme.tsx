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

  return useSyncExternalStore(subscribe, getSnapshot, () => "dark");
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<ColorScheme | null>(null);
  const effectiveTheme = themeOverride ?? scheme;

  // <body> sits outside the themed wrapper below — mirror the theme onto
  // <html> so the page background and native controls match.
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

  return (
    <ThemeContext.Provider value={value}>
      <div className={effectiveTheme} data-theme={effectiveTheme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
