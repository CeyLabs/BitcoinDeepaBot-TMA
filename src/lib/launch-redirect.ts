/**
 * Runs in <head> before anything else: a returning member opening the Mini
 * App (Telegram launch data in the URL + the "existing user" flag from an
 * earlier launch) goes straight to /dashboard, instead of loading and
 * starting the landing page only to redirect from it. The hash (launch
 * params) is kept. The launch registration still runs on /dashboard
 * (providers.tsx) and corrects a stale flag.
 */
export const LAUNCH_REDIRECT_SCRIPT = `(function(){try{if(location.pathname==="/"&&location.hash.indexOf("tgWebAppData=")!==-1&&localStorage.getItem("bitcoin-deepa-is-existing-user")==="true"){window.__launchRedirect=1;location.replace("/dashboard"+location.search+location.hash);}}catch(e){}})();`;

/**
 * Runs at the end of <body>, i.e. once the CSS has loaded and the
 * server-rendered page (skeleton, in the right theme) is in place. Telegram
 * covers the Mini App with its own placeholder until it gets `web_app_ready`;
 * sending it here, instead of after the JS has loaded and hydrated, shows
 * our page seconds earlier on slow phones. Same transports as the SDK:
 * postMessage in Telegram Web (iframe), TelegramWebviewProxy on mobile and
 * desktop, external.notify as a last resort. setupTelegram() sends it again
 * after hydration (harmless). Skipped while LAUNCH_REDIRECT_SCRIPT is
 * leaving for /dashboard, so `/` doesn't flash its skeleton first.
 */
export const EARLY_READY_SCRIPT = `(function(){try{if(window.__launchRedirect||location.hash.indexOf("tgWebAppData=")===-1)return;var w=window,m=JSON.stringify({eventType:"web_app_ready",eventData:{}});if(w.self!==w.top){w.parent.postMessage(m,"https://web.telegram.org");}else if(w.TelegramWebviewProxy&&w.TelegramWebviewProxy.postEvent){w.TelegramWebviewProxy.postEvent("web_app_ready","{}");}else if(w.external&&w.external.notify){w.external.notify(m);}}catch(e){}})();`;
