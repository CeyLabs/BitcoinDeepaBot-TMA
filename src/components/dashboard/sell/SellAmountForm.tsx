"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import type { BankAccount } from "@/hooks/query/useBankAccounts";
import { useSellPrice, useSellQuote, type SellOrder } from "@/hooks/query/useSell";
import { useWalletMetrics } from "@/hooks/query/useWalletMetrics";
import { fmtLkrExact, fmtSats } from "@/lib/formatters";
import { estimateSellLkr } from "@/lib/sell";
import { sellAmountSchema } from "@/lib/validations";
import { haptic } from "@/platform";

export function SellAmountForm({
  account,
  onQuoted,
}: {
  account: BankAccount;
  onQuoted: (order: SellOrder) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const { totalSats, isLoading: balanceLoading } = useWalletMetrics();
  const { data: price } = useSellPrice();
  const quote = useSellQuote();

  const sats = Number(value.replace(/[,\s]/g, "")) || 0;
  const estimate = price ? estimateSellLkr(sats, price.feeBasisPoints, price.btcLkrRate) : null;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The balance may still be loading: don't judge the amount against 0
    if (balanceLoading) return;
    const parsed = sellAmountSchema(totalSats, price?.minSats, price?.maxSats).safeParse(
      sats || undefined
    );
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      haptic.notify("error");
      return;
    }
    setError(undefined);
    haptic.impact("medium");
    quote.mutate(parsed.data, {
      onSuccess: onQuoted,
      onError: () => haptic.notify("error"),
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="bg-card flex flex-col gap-4 rounded-2xl p-5 [--field-bg:var(--card)]">
        <div className="flex items-center justify-between text-[13px] text-[#64748b] dark:text-[#94a3b8]">
          <span>Available</span>
          <span className="font-semibold">
            {balanceLoading ? "…" : `${fmtSats(totalSats)} sats`}
          </span>
        </div>

        <div className="relative">
          <TextField
            label="Amount (sats)"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 100,000"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/[^\d,]/g, ""));
              setError(undefined);
            }}
            error={error}
            className="[&_input]:pr-20"
          />
          <button
            type="button"
            disabled={!totalSats}
            onClick={() => {
              haptic.select();
              setValue(String(Math.min(totalSats, price?.maxSats ?? totalSats)));
              setError(undefined);
            }}
            className="bg-primary/10 text-primary absolute top-[17px] right-3 rounded-full px-3 py-1 text-[13px] font-semibold disabled:opacity-40"
          >
            Max
          </button>
        </div>

        <div className="flex flex-col gap-1.5 text-[14px]">
          <div className="flex justify-between">
            <span className="text-[#64748b] dark:text-[#94a3b8]">You get (estimate)</span>
            <span className="font-bold text-[#1b2027] dark:text-white">
              {estimate && sats > 0 ? `≈ ${fmtLkrExact(estimate.amountLkr)}` : "—"}
            </span>
          </div>
          {price && (
            <div className="flex justify-between text-[12px] text-[#94a3b8]">
              <span>
                Fee {(price.feeBasisPoints / 100).toFixed(2)}%
                {estimate && sats > 0 ? ` (${fmtLkrExact(estimate.feeLkr)})` : ""}
              </span>
              <span>1 BTC = {fmtLkrExact(price.btcLkrRate)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card flex items-center gap-3 rounded-2xl px-5 py-4">
        <Landmark size={22} className="text-hint shrink-0" />
        <div className="flex min-w-0 flex-col">
          <span className="text-[13px] text-[#64748b] dark:text-[#94a3b8]">Paid to</span>
          <span className="truncate text-[15px] font-semibold">
            {account.bankName} {account.accountNumber}
          </span>
        </div>
      </div>

      {quote.error instanceof Error && (
        <div className="rounded-2xl bg-[#f13131]/10 px-4 py-3">
          <p className="text-[13px] leading-4.5 text-[#f13131]">{quote.error.message}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-[12px]"
        loading={quote.isPending}
        disabled={!sats || balanceLoading}
      >
        Get quote
      </Button>
    </form>
  );
}
