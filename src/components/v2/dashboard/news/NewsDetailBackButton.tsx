"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBackButton } from "@telegram-apps/sdk-react";

export function NewsDetailBackButton() {
  const router = useRouter();
  const backButton = useBackButton();

  useEffect(() => {
    backButton.show();
    const handleBackClick = () => router.push("/v2/dashboard/news");
    backButton.on("click", handleBackClick);
    return () => {
      backButton.off("click", handleBackClick);
      backButton.hide();
    };
  }, [backButton, router]);

  return null;
}
