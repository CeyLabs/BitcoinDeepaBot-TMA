"use client";

import dynamic from "next/dynamic";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { PlatformProvider } from "@/platform";
import { useRegisterUser } from "@/hooks/useRegisterUser";
import { useTheme } from "./theme";

const ThemeProvider = dynamic(() => import("./theme"), { ssr: false });

// Keeps telegram-ui's own AppRoot appearance in sync with our ThemeProvider,
// otherwise Title/Cell/Button etc. never respond to the dev theme toggle.
function ThemedAppRoot({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <AppRoot platform="base" id="tg-ui-root" appearance={isDark ? "dark" : "light"}>
      {children}
    </AppRoot>
  );
}

// Registers/refreshes the Telegram user on launch, whichever route it lands on.
function RegisterUserOnLaunch() {
  useRegisterUser();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <PlatformProvider>
      <RegisterUserOnLaunch />
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ThemedAppRoot>{children}</ThemedAppRoot>
        </QueryClientProvider>
      </ThemeProvider>
    </PlatformProvider>
  );
}
