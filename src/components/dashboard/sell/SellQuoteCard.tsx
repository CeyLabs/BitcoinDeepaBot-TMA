"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { BankAccount } from "@/hooks/query/useBankAccounts";
import { useConfirmSell, type SellOrder } from "@/hooks/query/useSell";
import { FetchyError } from "@/lib/fetchy";
import { fmtLkrExact, fmtSats } from "@/lib/formatters";
import { useSecondsLeft } from "@/hooks/useSecondsLeft";
import { haptic, usePlatform } from "@/platform";

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
      message: `Sell ${fmtSats(quote.sats)} sats for ${fmtLkrExact(quote.amountLkr)} to ${account.bankName} ${account.accountNumber}? You'll approve the payment from your wallet next.`,
      confirmText: "Sell",
    });
    if (!ok) return;
    haptic.impact("heavy");
    try {
      const order = await confirm.mutateAsync(quote.id);
      haptic.notify("success");
      onConfirmed(order);
    } catch (err) {
      // No answer (network error, timeout) or a server error: the sale may
      // have gone through. The order page checks and shows what happened.
      if (!(err instanceof FetchyError) || err.status >= 500) {
        toast({
          title: "Checking your sale",
          description: "We didn't get an answer in time. Checking whether it went through.",
        });
        onConfirmed(quote);
        return;
      }
      haptic.notify("error");
      if (err.status === 410) {
        toast({ type: "error", title: "Quote expired", description: "Get a new quote to sell." });
        onBack();
        return;
      }
      toast({ type: "error", title: "Sale failed", description: err.message });
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
        <Row label="Value" value={fmtLkrExact(quote.grossLkr)} />
        <Row
          label={`Fee (${(quote.feeBasisPoints / 100).toFixed(2)}%)`}
          value={`− ${fmtLkrExact(quote.feeLkr)}`}
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
