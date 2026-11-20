// Fixed CTA bar for the plan picker. Sits just above the fixed bottom tab bar
// (16px gap + 64px pill), so the button stays reachable with the tab bar visible.
export const PLAN_CTA_BAR =
  "from-background fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-1/2 z-30 w-[min(440px,100vw)] -translate-x-1/2 bg-linear-to-t from-[74%] to-transparent px-4 pt-3 pb-3";
