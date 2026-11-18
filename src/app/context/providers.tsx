"use client";

import { environmentManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlatformProvider } from "@/platform";
import { useRegisterUser } from "@/hooks/useRegisterUser";
import { ToastProvider } from "@/components/ui/toast";
import ThemeProvider from "./theme";

// Registers/refreshes the Telegram user on launch (and after the session
// ends), whichever route it lands on.
function RegisterUserOnLaunch() {
  useRegisterUser();
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
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          {/* Needs the query client (useSession). */}
          <RegisterUserOnLaunch />
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </PlatformProvider>
  );
}
