"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SDKProvider, isTMA } from "@telegram-apps/sdk-react";
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

const PENDING_PLATFORM = createWebPlatform(null);

const PlatformContext = createContext<Platform>(PENDING_PLATFORM);

/**
 * Optimistic first guess so Telegram users get their theme and identity on
 * the very first render (no light/dark flash): if launch params are present
 * we're almost certainly inside Telegram. The async check below confirms it.
 */
function initialPlatform(): Platform {
  if (typeof window === "undefined") return PENDING_PLATFORM;
  const launch = readLaunch();
  return launch ? createTelegramPlatform(launch) : PENDING_PLATFORM;
}

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<Platform>(initialPlatform);

  useEffect(() => {
    let cancelled = false;
    detectTelegram().then((inTelegram) => {
      if (cancelled) return;
      if (inTelegram) {
        setupTelegram();
        // Keep the optimistic object if we already had it — avoids a
        // pointless re-render of every consumer.
        setPlatform((current) =>
          current.kind === "telegram" ? current : createTelegramPlatform()
        );
      } else {
        // e.g. a t.me URL with launch params pasted into a normal browser.
        setPlatform(createWebPlatform());
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
