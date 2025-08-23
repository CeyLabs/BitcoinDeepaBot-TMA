"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface TelegramThemeParams {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    header_bg_color?: string;
    accent_text_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    subtitle_text_color?: string;
    destructive_text_color?: string;
}

interface ThemeContextType {
    theme: "light" | "dark";
    themeParams: TelegramThemeParams | null;
    isDark: boolean;
    isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    themeParams: null,
    isDark: true,
    isLight: false,
});

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [currentThemeParams, setCurrentThemeParams] = useState<TelegramThemeParams | null>(null);

    useEffect(() => {
        const initTheme = () => {
            // Check if Telegram WebApp is available
            if (typeof window !== "undefined" && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;

                // Get initial theme params
                if (tg.themeParams) {
                    const params = tg.themeParams;
                    setCurrentThemeParams(params);

                    // Determine theme based on background color brightness
                    const bgColor = params.bg_color || "#000000";
                    const brightness = getBrightness(bgColor);
                    setTheme(brightness > 128 ? "light" : "dark");

                    // Update CSS variables
                    updateCSSVariables(params);
                }

                // Listen for theme changes
                tg.onEvent("themeChanged", () => {
                    console.log("Theme changed:", tg.themeParams);
                    if (tg.themeParams) {
                        setCurrentThemeParams(tg.themeParams);

                        // Determine theme based on background color brightness
                        const bgColor = tg.themeParams.bg_color || "#000000";
                        const brightness = getBrightness(bgColor);
                        setTheme(brightness > 128 ? "light" : "dark");

                        // Update CSS custom properties
                        updateCSSVariables(tg.themeParams);
                    }
                });
            } else {
                // Fallback: detect system theme
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                setTheme(prefersDark ? "dark" : "light");

                // Listen for system theme changes
                const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
                const handleChange = (e: MediaQueryListEvent) => {
                    setTheme(e.matches ? "dark" : "light");
                };

                mediaQuery.addEventListener("change", handleChange);
                return () => mediaQuery.removeEventListener("change", handleChange);
            }
        };

        initTheme();
    }, []);

    const value: ThemeContextType = {
        theme,
        themeParams: currentThemeParams,
        isDark: theme === "dark",
        isLight: theme === "light",
    };

    return (
        <ThemeContext.Provider value={value}>
            <div className={theme} data-theme={theme}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

// Helper function to calculate color brightness
function getBrightness(hexColor: string): number {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return 0;

    // Calculate perceived brightness using the formula: 0.299*R + 0.587*G + 0.114*B
    return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

// Update CSS custom properties with Telegram theme colors
// Only update text and component colors, not background colors (handled by BotFather settings)
function updateCSSVariables(params: TelegramThemeParams) {
    const root = document.documentElement;

    // Text colors - these need to adapt to the background set by BotFather
    if (params.text_color) {
        root.style.setProperty("--tg-theme-text-color", params.text_color);
        root.style.setProperty("--text-primary", params.text_color);
    }
    if (params.hint_color) {
        root.style.setProperty("--tg-theme-hint-color", params.hint_color);
        root.style.setProperty("--text-secondary", params.hint_color);
    }

    // Component colors that should adapt to theme
    if (params.link_color) {
        root.style.setProperty("--tg-theme-link-color", params.link_color);
        root.style.setProperty("--link", params.link_color);
    }
    if (params.button_color) {
        root.style.setProperty("--tg-theme-button-color", params.button_color);
        root.style.setProperty("--accent", params.button_color);
    }
    if (params.button_text_color) {
        root.style.setProperty("--tg-theme-button-text-color", params.button_text_color);
    }
    if (params.accent_text_color) {
        root.style.setProperty("--tg-theme-accent-text-color", params.accent_text_color);
    }
    if (params.subtitle_text_color) {
        root.style.setProperty("--tg-theme-subtitle-text-color", params.subtitle_text_color);
    }
    if (params.destructive_text_color) {
        root.style.setProperty("--tg-theme-destructive-text-color", params.destructive_text_color);
    }

    // Keep section colors for component backgrounds (cards, modals, etc.)
    if (params.secondary_bg_color) {
        root.style.setProperty("--tg-theme-secondary-bg-color", params.secondary_bg_color);
        root.style.setProperty("--bg-secondary", params.secondary_bg_color);
    }
    if (params.section_bg_color) {
        root.style.setProperty("--tg-theme-section-bg-color", params.section_bg_color);
    }
    if (params.section_header_text_color) {
        root.style.setProperty(
            "--tg-theme-section-header-text-color",
            params.section_header_text_color
        );
    }
}