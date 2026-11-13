"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "./register-sw";
// Imported for its side effect: start listening for beforeinstallprompt as
// early as possible, on every page.
import "./install";

/** Mounted once in the root layout. */
export function PwaSetup() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
