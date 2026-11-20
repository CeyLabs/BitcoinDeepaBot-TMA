"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "./register-sw";
import { reloadOnChunkLoadError } from "./chunk-reload";
// Imported for its side effect: start listening for beforeinstallprompt as
// early as possible, on every page.
import "./install";

/** Mounted once in the root layout. */
export function PwaSetup() {
  useEffect(() => {
    registerServiceWorker();
    reloadOnChunkLoadError();
  }, []);

  return null;
}
