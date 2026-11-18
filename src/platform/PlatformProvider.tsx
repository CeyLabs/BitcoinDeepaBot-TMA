"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { SDKProvider, isTMA, request } from "@telegram-apps/sdk-react";
import { createTelegramPlatform, readLaunch, setupTelegram } from "./telegram";
import { createWebPlatform } from "./web";
import type { Platform } from "./types";

/**
 * The async "complete" isTMA() round-trips a real Mini Apps method call and
 * only resolves true if Telegram actually answers — launch params alone can
 * be copied into a normal browser.
 */
async function detectTelegram(): Promise<boolean> {
  // Cast around the ambient overload set — depending on which of
  // @telegram-apps/sdk's and @telegram-apps/bridge's declarations TS resolves
  // through the re-export chain, it sometimes only "sees" the sync signature.
  const isTMAComplete = isTMA as unknown as (type: "complete") => Promise<boolean>;
  try {
    return await isTMAComplete("complete");
  } catch {
    return false;
  }
}

/**
 * isTMA() only waits 100 ms for Telegram Web (an iframe) to answer, so a slow
 * tab could look like a plain browser. When launch params are present, don't
 * downgrade on that single miss:
 * - In an iframe it's Telegram Web — frame-ancestors only lets *.telegram.org
 *   embed us (next.config.mjs).
 * - Otherwise ask again with a longer timeout before giving up.
 * Without launch params (a normal browser) the quick check is enough.
 */
async function confirmTelegram(hasLaunchParams: boolean): Promise<boolean> {
  if (await detectTelegram()) return true;
  if (!hasLaunchParams) return false;
  if (window.self !== window.top) return true;
  try {
    await request({ method: "web_app_request_theme", event: "theme_changed", timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

const PENDING_PLATFORM = createWebPlatform(null);

const PlatformContext = createContext<Platform>(PENDING_PLATFORM);

/*
  Optimistic first guess: if launch params are present we're almost certainly
  inside Telegram, so use that right after hydration instead of waiting for
  the async check (which confirms or corrects it). Read through
  useSyncExternalStore so the server render and hydration both see "pending"
  (no mismatch) and the guess applies in the same commit.
*/
let optimistic: Platform | undefined;
function getOptimisticPlatform(): Platform {
  if (optimistic === undefined) {
    const launch = readLaunch();
    optimistic = launch ? createTelegramPlatform(launch) : PENDING_PLATFORM;
  }
  return optimistic;
}
const subscribeNever = () => () => {};

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const optimisticPlatform = useSyncExternalStore(
    subscribeNever,
    getOptimisticPlatform,
    () => PENDING_PLATFORM
  );
  const [confirmed, setConfirmed] = useState<Platform | null>(null);
  const platform = confirmed ?? optimisticPlatform;

  useEffect(() => {
    let cancelled = false;
    // Launched by Telegram: drop its loading placeholder as soon as we've
    // hydrated (the server-rendered UI is already on screen) instead of after
    // the async confirmation below.
    if (readLaunch()) setupTelegram();
    confirmTelegram(!!readLaunch()).then((inTelegram) => {
      if (cancelled) return;
      if (inTelegram) {
        setupTelegram();
        // Reuse the optimistic object if it's already Telegram — avoids a
        // pointless re-render of every consumer.
        const guess = getOptimisticPlatform();
        setConfirmed(guess.kind === "telegram" ? guess : createTelegramPlatform());
      } else {
        // e.g. a t.me URL with launch params pasted into a normal browser.
        setConfirmed(createWebPlatform());
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SDKProvider>
      <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>
    </SDKProvider>
  );
}

/** Current platform. `kind` is null until detection finishes. */
export function usePlatform(): Platform {
  return useContext(PlatformContext);
}
