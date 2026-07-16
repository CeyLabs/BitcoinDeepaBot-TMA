"use client";

import { useLaunchParams } from "@telegram-apps/sdk-react";

const MOBILE_PLATFORMS = ["ios", "android"];

/**
 * Identifies the Telegram client the Mini App is running in.
 * `isMobile` is true only for the native iOS/Android apps — used to gate
 * features (e.g. camera-based KYC) that don't work on desktop/web clients.
 */
export function useTelegramPlatform() {
  const launchParams = useLaunchParams(true);
  const platform = launchParams?.platform;

  return {
    platform,
    isMobile: !!platform && MOBILE_PLATFORMS.includes(platform),
  };
}
