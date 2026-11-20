"use client";

import { createContext, use, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";

export type TradeKind = "buy" | "sell";

interface SheetsContextValue {
  /** Profile & settings sheet (avatar in the header). */
  openSettings: () => void;
  /** Buy / Sell keypad flow (wallet quick actions). */
  openTrade: (kind: TradeKind) => void;
  /** Send sats to another Bitcoin Deepa user. */
  openSend: () => void;
}

const SheetsContext = createContext<SheetsContextValue | null>(null);

// The sheets' code loads on first open, not with the page.
const SettingsSheet = dynamic(() => import("./settings/SettingsSheet"), { ssr: false });
const TradeSheet = dynamic(() => import("./trade/TradeSheet"), { ssr: false });
const SendSheet = dynamic(() => import("./send/SendSheet"), { ssr: false });

/** App-level sheets any dashboard screen can open. Mounted once in the dashboard layout. */
export function SheetsProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMounted, setSettingsMounted] = useState(false);
  const [trade, setTrade] = useState<{ open: boolean; kind: TradeKind; key: number } | null>(null);
  const [send, setSend] = useState<{ open: boolean; key: number } | null>(null);

  const openSettings = useCallback(() => {
    setSettingsMounted(true);
    setSettingsOpen(true);
  }, []);
  const openTrade = useCallback(
    (kind: TradeKind) => setTrade((t) => ({ open: true, kind, key: (t?.key ?? 0) + 1 })),
    []
  );

  const openSend = useCallback(() => setSend((s) => ({ open: true, key: (s?.key ?? 0) + 1 })), []);

  const value = useMemo(
    () => ({ openSettings, openTrade, openSend }),
    [openSettings, openTrade, openSend]
  );

  return (
    <SheetsContext value={value}>
      {children}
      {settingsMounted && <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />}
      {trade && (
        <TradeSheet
          // A fresh flow every time it's opened.
          key={trade.key}
          open={trade.open}
          initialKind={trade.kind}
          onOpenChange={(open) => setTrade((t) => (t ? { ...t, open } : t))}
        />
      )}
      {send && (
        <SendSheet
          // A fresh payment (and payment key) every time it's opened.
          key={send.key}
          open={send.open}
          onOpenChange={(open) => setSend((s) => (s ? { ...s, open } : s))}
        />
      )}
    </SheetsContext>
  );
}

export function useSheets() {
  const ctx = use(SheetsContext);
  if (!ctx) throw new Error("useSheets must be used inside SheetsProvider");
  return ctx;
}
