"use client";

import { cn } from "cn";
import { useTheme } from "@/app/context/theme";
import { Icon } from "@/components/dashboard/settings/icons";
import { haptic } from "@/platform";
import { AnimatedLogo, useDrawOffset } from "@/components/ui/animated-logo";

/** Light/dark toggle (top-right of the landing); saves an Appearance override. */
export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, setPreference } = useTheme();
  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        haptic.select();
        setPreference(isDark ? "light" : "dark");
      }}
      className={cn(
        "press hit bg-chip text-ink2 flex size-10 items-center justify-center rounded-full border-0",
        className
      )}
    >
      <Icon name={isDark ? "sun" : "moon"} />
    </button>
  );
}

/**
 * The landing logo, drawn by hand from the eyes outward (AnimatedLogo), with
 * a soft, slowly pulsing warm glow behind it. The
 * same size on the start screen and the sign-in/welcome screens, so it
 * doesn't jump when the content arrives; `loading` makes the glow pulse.
 */
export function LogoStage({ loading }: { loading?: boolean }) {
  const offset = useDrawOffset();
  return (
    <div
      data-loading={loading || undefined}
      data-drawn={offset === null || undefined}
      style={{ "--yaka-t0": `${offset ?? 0}s` } as React.CSSProperties}
      className="relative h-[220px] w-full max-w-[320px]"
    >
      <div aria-hidden className="logo-glow" />
      <div className="logo-float absolute inset-0">
        <AnimatedLogo offset={offset} />
      </div>
    </div>
  );
}

/**
 * Full-screen landing surface for the screens outside the dashboard (welcome,
 * sign-in, errors, payment results): plain card background and a centered column.
 */
export function LandingShell({
  children,
  className,
  themeToggle,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  /** Show the light/dark toggle in the top-right corner. */
  themeToggle?: boolean;
  "aria-label"?: string;
}) {
  return (
    // Plain page in the card colour; content in a centered phone-width column.
    // data-surface paints the body, status bar and Telegram header to match
    // (styles/theme.css, ThemeProvider). The height leaves out the installed
    // PWA's status-bar padding, so the page fits the screen without scrolling.
    <div
      data-surface="card"
      className="bg-card min-h-[calc(100dvh-var(--top-inset))] overflow-x-clip transition-colors duration-300"
    >
      <main
        aria-label={ariaLabel}
        className="relative mx-auto flex min-h-[calc(100dvh-var(--top-inset))] w-full max-w-[440px] flex-col"
      >
        {themeToggle && <ThemeToggle className="absolute top-4 right-4 z-10" />}
        <div
          className={cn(
            "flex w-full grow flex-col justify-center px-5 pt-6 pb-[calc(28px+env(safe-area-inset-bottom))]",
            className
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
