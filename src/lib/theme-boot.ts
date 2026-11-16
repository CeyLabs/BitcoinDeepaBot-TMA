/**
 * Runs in <head> before first paint: picks light/dark the same way
 * ThemeProvider (app/context/theme.tsx) will (Telegram's theme from the launch URL, else the OS) and
 * sets <html data-theme>, so server-rendered content never
 * flashes the wrong theme.
 *
 * The launch params are only in the hash on the first load; after a client
 * navigation + reload, read the copy the SDK keeps in sessionStorage.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var s,p=location.hash;if(p.indexOf("tgWebAppThemeParams")<0)try{p=sessionStorage.getItem("telegram-apps/launch-params")||""}catch(e){}var m=/tgWebAppThemeParams=([^&"]+)/.exec(p);if(m){var bg=(JSON.parse(decodeURIComponent(m[1])).bg_color||"").replace("#","");if(bg.length===6){var r=parseInt(bg.slice(0,2),16),g=parseInt(bg.slice(2,4),16),b=parseInt(bg.slice(4,6),16);s=Math.sqrt(0.299*r*r+0.587*g*g+0.114*b*b)<120?"dark":"light";}}if(!s)s=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var d=document.documentElement;d.dataset.theme=s;d.style.colorScheme=s;}catch(e){}})();`;
