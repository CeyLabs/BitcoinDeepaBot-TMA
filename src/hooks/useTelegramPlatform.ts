"use client";

import { retrieveLaunchParams } from "@telegram-apps/sdk-react";

const MOBILE_PLATFORMS = ["ios", "android"];

/**
 * Identifies the Telegram client the Mini App is running in.
 * `isMobile` is true only for the native iOS/Android apps — used to gate
 * features (e.g. camera-based KYC) that don't work on desktop/web clients.
 *
 * Uses the plain retrieveLaunchParams() function (not the useLaunchParams()
 * hook) in a try/catch — the hook throws outside Telegram even with the ssr
 * flag set, whereas this is just a regular function call we can safely
 * swallow errors from.
 */
export function useTelegramPlatform() {
  let platform: string | undefined;
  try {
    // Cast around the same ambient-overload flakiness noted in
    // useIsTelegramEnv.ts — TS sometimes only resolves the 0-arg signature.
    const retrieveCamelCased = retrieveLaunchParams as unknown as (camelCase: true) => {
      platform?: string;
    };
    platform = retrieveCamelCased(true).platform;
  } catch {
    platform = undefined;
  }

  return {
    platform,
    isMobile: !!platform && MOBILE_PLATFORMS.includes(platform),
  };
}
