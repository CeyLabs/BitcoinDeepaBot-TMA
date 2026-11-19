"use client";

import { ChoosePlanView } from "@/components/dashboard/plans/ChoosePlanView";

// Pushed from the Plans tab ("Change plan") and from onboarding. Lives in the
// dashboard layout so the tab bar stays visible.
export default function ChoosePlanPage() {
  return <ChoosePlanView />;
}
