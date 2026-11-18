"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { BankAccount } from "@/hooks/query/useBankAccounts";
import { useConfirmSell, type SellOrder } from "@/hooks/query/useSell";
import { FetchyError } from "@/lib/fetchy";
import { fmtLkrExact, fmtSats } from "@/lib/formatters";
import { haptic, usePlatform } from "@/platform";

function useSecondsLeft(expiresAt: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
      <span className="text-[#64748b] dark:text-[#94a3b8]">{label}</span>
      <span
        className={strong ? "font-bold text-[#1b2027] dark:text-white" : "text-right font-medium"}
      >
        {value}
      </span>
    </div>
  );
}

/** The locked price: confirm before it expires, or get a new one. */
export function SellQuoteCard({
  quote,
  account,
  onBack,
  onConfirmed,
}: {
  quote: SellOrder;
  account: BankAccount;
  onBack: () => void;
  onConfirmed: (order: SellOrder) => void;
}) {
  const platform = usePlatform();
  const toast = useToast();
  const confirm = useConfirmSell();
  const secondsLeft = useSecondsLeft(quote.expiresAt);
  const expired = secondsLeft === 0;

  const onSell = async () => {
    const ok = await platform.confirm({
      title: "Sell sats",
      message: `Sell ${fmtSats(quote.sats)} sats for ${fmtLkrExact(quote.amountLkr)} to ${account.bankName} ${account.accountNumber}? This can't be undone.`,
      confirmText: "Sell",
    });
    if (!ok) return;
    haptic.impact("heavy");
    try {
      const order = await confirm.mutateAsync(quote.id);
      haptic.notify("success");
      onConfirmed(order);
    } catch (err) {
      haptic.notify("error");
      if (err instanceof FetchyError && err.status === 410) {
        toast({ type: "error", title: "Quote expired", description: "Get a new quote to sell." });
        onBack();
        return;
      }
      toast({
        type: "error",
        title: "Sale failed",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-card flex flex-col gap-3 rounded-2xl p-5">
        <div className="flex flex-col items-center gap-1 pb-2 text-center">
          <span className="text-[13px] text-[#64748b] dark:text-[#94a3b8]">You receive</span>
          <span className="text-[30px] leading-9 font-bold text-[#1b2027] dark:text-white">
            {fmtLkrExact(quote.amountLkr)}
          </span>
        </div>
        <Row label="You sell" value={`${fmtSats(quote.sats)} sats`} />
        <Row
          label={`Fee (${(quote.feeBasisPoints / 100).toFixed(2)}%)`}
          value={`${fmtSats(quote.feeSats)} sats`}
        />
        <Row label="Rate" value={`1 BTC = ${fmtLkrExact(quote.btcLkrRate)}`} />
        <Row label="Paid to" value={`${account.bankName} ${account.accountNumber}`} />
      </div>

      <p className="text-center text-[13px] text-[#64748b] dark:text-[#94a3b8]">
        {expired ? "This price has expired." : `Price locked for ${secondsLeft}s`}
      </p>

      {expired ? (
        <Button size="lg" className="w-full rounded-[12px]" onClick={onBack}>
          Get a new quote
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full rounded-[12px]"
            loading={confirm.isPending}
            onClick={() => void onSell()}
          >
            Sell now
          </Button>
          <Button
            variant="secondary"
            className="w-full rounded-[12px]"
            disabled={confirm.isPending}
            onClick={onBack}
          >
            Change amount
          </Button>
        </div>
      )}
    </div>
  );
}
