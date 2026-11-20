"use client";

import { environmentManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlatformProvider } from "@/platform";
import { useRegisterUser } from "@/hooks/useRegisterUser";
import { useRegisterTelegramUser } from "@/hooks/query/useRegisterTelegramUser";
import { usePlatform } from "@/platform";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmHost } from "@/components/ui/confirm-dialog";
import { OfflineBanner } from "@/components/offline-banner";
import { SwipeClickGuard } from "@/components/swipe-click-guard";
import { useBotWalletInit } from "@/hooks/useBotWalletInit";
import { useToast } from "@/components/ui/toast";
import { TELEGRAM_BOT_URL } from "@/lib/constants";
import ThemeProvider from "./theme";

// Registers/refreshes the Telegram user on launch (and after the session
// ends), whichever route it lands on.
function RegisterUserOnLaunch() {
  const launch = usePlatform().launch;
  useRegisterUser();
  useRegisterTelegramUser(launch?.initData, launch?.raw);
  return null;
}

// Creates the bot wallet in the background for users who never started the
// bot. Needs the toast provider (the "Open the bot" nudge).
function BotWalletOnLaunch() {
  const toast = useToast();
  const platform = usePlatform();
  useBotWalletInit(() =>
    toast({
      title: "Get updates from the bot",
      description: (
        <button
          type="button"
          className="text-primary font-semibold underline"
          onClick={() => platform.openTelegramLink(TELEGRAM_BOT_URL)}
        >
          Open the bot and press Start
        </button>
      ),
      timeout: 15_000,
    })
  );
  return null;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      // Don't refetch on every mount/focus; data is fresh for a minute.
      queries: { staleTime: 60 * 1000 },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// TanStack's Next.js setup: a new client per server render, one shared client
// in the browser (kept even if React throws away a suspended first render).
function getQueryClient() {
  if (environmentManager.isServer()) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <PlatformProvider>
      <SwipeClickGuard />
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          {/* Needs the query client (useSession). */}
          <RegisterUserOnLaunch />
          <ToastProvider>
            <BotWalletOnLaunch />
            <OfflineBanner />
            {children}
            <ConfirmHost />
          </ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </PlatformProvider>
  );
}
