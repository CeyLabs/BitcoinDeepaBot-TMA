"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useBuyPrice, useCreateBuyLink } from "@/hooks/query/useBuy";
import { estimateBuy } from "@/lib/buy";
import { FetchyError } from "@/lib/fetchy";
import { fmtLkrExact, fmtSats } from "@/lib/formatters";
import { usePayHereRedirect } from "@/lib/hooks";
import { buyAmountSchema } from "@/lib/validations";
import { haptic } from "@/platform";

const QUICK_AMOUNTS = [1_000, 5_000, 10_000, 25_000];

export function BuyAmountForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const { data: price } = useBuyPrice();
  const createLink = useCreateBuyLink();
  const redirectToPayHere = usePayHereRedirect();

  const amount = Number(value.replace(/[,\s]/g, "")) || 0;
  const estimate = price
    ? estimateBuy(
        amount,
        price.paymentProcessorFeeBasisPoints,
        price.bitcoindeepaFeeBasisPoints,
        price.btcLkrPrice
      )
    : null;
  const feePercent = price
    ? (price.paymentProcessorFeeBasisPoints + price.bitcoindeepaFeeBasisPoints) / 100
    : null;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = buyAmountSchema(price?.minLkr, price?.maxLkr).safeParse(amount || undefined);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      haptic.notify("error");
      return;
    }
    setError(undefined);
    haptic.impact("medium");
    createLink.mutate(parsed.data, {
      onSuccess: ({ link }) => {
        haptic.notify("success");
        redirectToPayHere(link);
      },
      onError: (err) => {
        // Backend's KycVerifiedGuard rejects with 403 until KYC is approved
        if (err instanceof FetchyError && err.status === 403) {
          router.push("/verification");
          return;
        }
        haptic.notify("error");
      },
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="bg-card flex flex-col gap-4 rounded-2xl p-5 [--field-bg:var(--card)]">
        <TextField
          label="Amount (LKR)"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 5,000"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/[^\d,]/g, ""));
            setError(undefined);
          }}
          error={error}
        />

        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.filter((a) => !price || (a >= price.minLkr && a <= price.maxLkr)).map(
            (a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  haptic.select();
                  setValue(a.toLocaleString("en-US"));
                  setError(undefined);
                }}
                className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[13px] font-semibold"
              >
                {a.toLocaleString("en-US")}
              </button>
            )
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-[14px]">
          <div className="flex justify-between">
            <span className="text-[#64748b] dark:text-[#94a3b8]">You get (estimate)</span>
            <span className="font-bold text-[#1b2027] dark:text-white">
              {estimate && amount > 0 ? `≈ ${fmtSats(estimate.sats)} sats` : "—"}
            </span>
          </div>
          {price && feePercent !== null && (
            <div className="flex justify-between text-[12px] text-[#94a3b8]">
              <span>
                Fees {feePercent.toFixed(2)}%
                {estimate && amount > 0 ? ` (${fmtLkrExact(estimate.feeLkr)})` : ""}
              </span>
              <span>1 BTC = {fmtLkrExact(price.btcLkrPrice)}</span>
            </div>
          )}
          {price && (
            <p className="text-[12px] text-[#94a3b8]">
              {fmtLkrExact(price.minLkr)} – {fmtLkrExact(price.maxLkr)} per buy. The final amount of
              sats uses the price when your payment is confirmed.
            </p>
          )}
        </div>
      </div>

      {createLink.error instanceof Error &&
        !(createLink.error instanceof FetchyError && createLink.error.status === 403) && (
          <div className="rounded-2xl bg-[#f13131]/10 px-4 py-3">
            <p className="text-[13px] leading-4.5 text-[#f13131]">{createLink.error.message}</p>
          </div>
        )}

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-[12px]"
        loading={createLink.isPending || createLink.isSuccess}
        disabled={!amount}
      >
        Pay with PayHere
      </Button>
    </form>
  );
}
