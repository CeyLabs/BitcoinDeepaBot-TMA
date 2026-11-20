import { redirect } from "next/navigation";

// Moved under the dashboard so the tab bar shows. Kept for old links
// (bot messages, PayHere return URLs, installed PWAs).
export default function LegacyChoosePlanPage() {
  redirect("/dashboard/plans/choose");
}
