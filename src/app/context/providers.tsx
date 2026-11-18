"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
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

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
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
