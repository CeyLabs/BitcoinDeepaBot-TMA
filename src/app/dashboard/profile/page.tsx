"use client";

import { useRouter } from "next/navigation";
import { PushHeader } from "@/components/ui/back-button";
import { SettingsContent } from "@/components/dashboard/settings/SettingsContent";

/** Deep-link route for the settings sheet: the same content as a pushed page. */
export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5">
      <PushHeader title="Profile & settings" onBack={() => router.push("/dashboard")} />
      <SettingsContent className="pb-6" />
    </div>
  );
}
