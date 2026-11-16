// A page younger than this was just loaded from the network, so it's already
// the newest build — reloading it would only flash a blank screen.
const FRESH_MS = 60_000;

// Never reload mid-task: plan checkout (PayHere redirect), KYC and payment
// return screens. A pending reload waits until the user is elsewhere.
const BUSY_PATHS = ["/plans/choose", "/verification", "/payment"];

const isBusy = () => BUSY_PATHS.some((path) => location.pathname.startsWith(path));

let started = false;

/**
 * Registers /sw.js (production only) and keeps installed apps up to date:
 * checks for a new worker on start and whenever the app returns to the
 * foreground, then reloads once the new worker takes control — never on first
 * install, on a freshly loaded page, while busy, or more than once.
 */
export function registerServiceWorker() {
  if (started || !("serviceWorker" in navigator)) return;
  started = true;

  const sw = navigator.serviceWorker;

  // In dev, chunk URLs aren't content-hashed, so a cache-first worker would
  // serve stale JS after every edit. Remove any worker a previous
  // production-mode run left behind.
  if (process.env.NODE_ENV !== "production") {
    sw.getRegistrations()
      .then((registrations) => registrations.forEach((r) => r.unregister()))
      .catch(() => {});
    return;
  }

  // An existing controller means this is an update, not the first install.
  const hadController = !!sw.controller;
  let reloaded = false;
  let pending = false;
  let resumed = false;

  const reload = () => {
    if (reloaded) return;
    if (isBusy()) {
      pending = true;
      return;
    }
    reloaded = true;
    location.reload();
  };

  sw.addEventListener("controllerchange", () => {
    if (hadController && (resumed || performance.now() > FRESH_MS)) reload();
  });

  let registration: ServiceWorkerRegistration | undefined;
  sw.register("/sw.js", { scope: "/", updateViaCache: "none" })
    .then((reg) => {
      registration = reg;
      return reg.update();
    })
    .catch(() => {});

  // SPA navigations don't trigger update checks, and installed iOS apps only
  // check on launch — so also check whenever the app comes back.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    resumed = true;
    if (pending) reload();
    registration?.update().catch(() => {});
  });
}
