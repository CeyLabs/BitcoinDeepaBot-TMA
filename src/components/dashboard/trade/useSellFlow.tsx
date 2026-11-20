"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { KeyValueList } from "@/components/ui/section";
import { useToast } from "@/components/ui/toast";
import { useSheets } from "@/components/dashboard/sheets";
import { bankRequiredCopy } from "@/components/dashboard/sell/bank-required";
import {
  isSellInProgress,
  SellOrderPending,
  SellOrderStatus,
} from "@/components/dashboard/sell/SellOrderStatus";
import { useBankAccounts } from "@/hooks/query/useBankAccounts";
import {
  useConfirmSell,
  useSellOrder,
  useSellPrice,
  useSellQuote,
  type SellOrder,
} from "@/hooks/query/useSell";
import { useWalletMetrics } from "@/hooks/query/useWalletMetrics";
import { FetchyError } from "@/lib/fetchy";
import { fmtLkrCurrency, fmtLkrExact, fmtSats } from "@/lib/formatters";
import { estimateSellLkr, satsForLkr } from "@/lib/sell";
import { sellAmountSchema } from "@/lib/validations";
import { haptic } from "@/platform";
import type { FlowArgs, FlowStep, FlowView } from "./flow";
import { DualAmount, DualHint, GateNotice, useDualAmount } from "./DualAmount";
import { Presets, PriceFooter } from "./keypad";
import { ErrorRow, HoldButton, LockRow, ReviewHeader } from "./parts";
import { fmtFeePercent } from "./useBuyFlow";
import { verifyCopy } from "./verify-copy";

function useSecondsLeft(expiresAt: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
}

/**
 * Sell: amount (type sats or rupees) → review with the real quote and its
 * expiry → press and hold to confirm → the order's status, polled until it's
 * done. Missing KYC or a verified bank shows as a notice on the amount screen.
 */
export function useSellFlow({ kyc, close }: FlowArgs): FlowView {
  const router = useRouter();
  const toast = useToast();
  const { openSettings } = useSheets();
  const [step, setStep] = useState<FlowStep>("amount");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [quote, setQuote] = useState<SellOrder | null>(null);
  // How long the quote was held for when it arrived (drives the ring)
  const [lockSeconds, setLockSeconds] = useState(60);
  const [forceExpired, setForceExpired] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { totalSats, balanceAvailable, isLoading: balanceLoading } = useWalletMetrics();
  const { data: price } = useSellPrice();
  const { current: bankAccount, verified, isLoading: bankLoading } = useBankAccounts();
  const quoteM = useSellQuote();
  const confirm = useConfirmSell();
  const { data: order } = useSellOrder(orderId ?? "");
  const secondsLeft = useSecondsLeft(quote?.expiresAt);

  const d = useDualAmount({
    initial: "sats",
    toSats: (lkr) => (price ? satsForLkr(lkr, price.feeBasisPoints, price.btcLkrRate) : 0),
    toLkr: (sats) =>
      price
        ? Math.floor(estimateSellLkr(sats, price.feeBasisPoints, price.btcLkrRate).amountLkr)
        : 0,
  });
  const sats = d.sats;
  // The balance may still be loading: don't judge the amount against 0
  const parsed =
    d.hasValue && !balanceLoading
      ? sellAmountSchema(totalSats, price?.minSats, price?.maxSats).safeParse(sats)
      : null;
  const error = parsed && !parsed.success ? parsed.error.issues[0]?.message : undefined;
  const amountOk = !!parsed?.success && balanceAvailable;
  const maxSats = Math.min(totalSats, price?.maxSats ?? totalSats);

  const ready = kyc.approved && !!verified;
  // The review needs a quote, KYC and a verified bank (any can change while it's open).
  const current: FlowStep = step === "review" && quote && ready ? "review" : "amount";
  const bankLabel = verified ? `${verified.bankName} ${verified.accountNumber}` : "your bank";
  const busy = confirm.isPending;

  const go = (to: FlowStep, d: "fwd" | "back") => {
    setDir(d);
    setStep(to);
  };

  const getQuote = (forSats: number, then?: () => void) => {
    quoteM.mutate(forSats, {
      onSuccess: (q) => {
        setQuote(q);
        setForceExpired(false);
        setLockSeconds(
          Math.max(1, Math.round((new Date(q.expiresAt).getTime() - Date.now()) / 1000))
        );
        then?.();
      },
      onError: () => haptic.notify("error"),
    });
  };

  const onContinue = () => {
    if (!amountOk || !ready || !parsed?.success) return;
    haptic.impact("light");
    getQuote(parsed.data, () => go("review", "fwd"));
  };

  const onSell = async () => {
    if (!quote) return;
    haptic.impact("heavy");
    try {
      const confirmed = await confirm.mutateAsync(quote.id);
      haptic.notify("success");
      setOrderId(confirmed.id);
    } catch (err) {
      // No answer (network error, timeout) or a server error: the sale may
      // have gone through. The status screen checks and shows what happened.
      if (!(err instanceof FetchyError) || err.status >= 500) {
        toast({
          title: "Checking your sale",
          description: "We didn't get an answer in time. Checking whether it went through.",
        });
        setOrderId(quote.id);
        return;
      }
      haptic.notify("error");
      if (err.status === 410) {
        setForceExpired(true);
        toast({ type: "error", title: "Quote expired", description: "Refresh to get a new rate." });
        return;
      }
      toast({ type: "error", title: "Sale failed", description: err.message });
    }
  };

  // ── Status (after confirm) ─────────────────────────────────────────────
  if (orderId) {
    const inProgress = isSellInProgress(order?.status);
    return {
      title: order?.status === "COMPLETED" ? "Sold" : inProgress ? "Selling" : "Sale",
      showKindToggle: false,
      stepKey: "status",
      dir: "fwd",
      body: order ? (
        <SellOrderStatus order={order} bankLabel={bankLabel} />
      ) : (
        <SellOrderPending bankLabel={bankLabel} />
      ),
      footer: (
        <div className="flex flex-col gap-1">
          <Button variant={inProgress ? "secondary" : "default"} onClick={close}>
            {inProgress ? "Close" : "Done"}
          </Button>
          <Button
            variant="text"
            size="text"
            className="w-full"
            onClick={() => {
              close();
              router.push(`/dashboard/sell/${orderId}`);
            }}
          >
            {inProgress ? "We'll keep going. Track this sale" : "View sale"}
          </Button>
        </div>
      ),
      busy: false,
    };
  }

  let title = "Sell bitcoin";
  let body: React.ReactNode;
  let footer: React.ReactNode;

  if (current === "amount") {
    let hint: string;
    if (error) hint = error;
    else if (balanceLoading) hint = "Checking your balance…";
    else if (!balanceAvailable) hint = "Your balance couldn't be loaded right now";
    else hint = `You have ${fmtSats(totalSats)} sats`;

    const kycGate = !kyc.loading && !kyc.approved ? verifyCopy(kyc.status) : null;
    const bankGate = !kycGate && !bankLoading && !verified ? bankRequiredCopy(bankAccount) : null;

    body = (
      <div className="pt-3">
        {kycGate && (
          <GateNotice
            title={kycGate.title}
            text={kycGate.text}
            action={
              kycGate.cta
                ? {
                    label: kycGate.cta,
                    onClick: () => {
                      close();
                      router.push("/verification");
                    },
                  }
                : undefined
            }
          />
        )}
        {bankGate && (
          <GateNotice
            title={bankGate.title}
            text={bankGate.short}
            action={
              bankGate.inReview
                ? undefined
                : {
                    label: "Add bank",
                    onClick: () => {
                      haptic.impact("medium");
                      close();
                      // Let this sheet slide away before the settings sheet comes up
                      window.setTimeout(openSettings, 260);
                    },
                  }
            }
          />
        )}
        <DualAmount
          id="sell"
          d={d}
          top={{ unit: "sats", label: "You sell" }}
          bottom={{ unit: "lkr", label: "You receive (estimate)" }}
          invalid={!!error}
        />
        <DualHint invalid={!!error || (!balanceLoading && !balanceAvailable)}>{hint}</DualHint>
        <Presets
          items={[25, 50, 75, 100].map((pc) => {
            const v = pc === 100 ? maxSats : Math.floor((totalSats * pc) / 100);
            return {
              label: pc === 100 ? (maxSats < totalSats ? "Max" : "All") : `${pc}%`,
              on: d.active === "sats" && v > 0 && sats === v,
              disabled: balanceLoading || v <= 0,
              pick: () => d.set("sats", v > 0 ? v : ""),
            };
          })}
        />
        {quoteM.error instanceof Error && (
          <div className="pt-2">
            <ErrorRow>{quoteM.error.message}</ErrorRow>
          </div>
        )}
        {price && (
          <PriceFooter>
            1 BTC ≈ {fmtLkrCurrency(price.btcLkrRate)} · {fmtFeePercent(price.feeBasisPoints)} fee
          </PriceFooter>
        )}
      </div>
    );
    footer = (
      <Button
        disabled={!amountOk || !ready}
        loading={quoteM.isPending || ((kyc.loading || bankLoading) && amountOk)}
        onClick={onContinue}
      >
        Review
      </Button>
    );
  } else if (quote) {
    title = "Review sale";
    const expired = forceExpired || secondsLeft === 0;
    body = (
      <>
        <ReviewHeader
          caption="You receive"
          big={fmtLkrExact(quote.amountLkr)}
          small={`for ${fmtSats(quote.sats)} sats`}
        />
        <LockRow
          secondsLeft={secondsLeft}
          totalSeconds={lockSeconds}
          expired={expired}
          refreshing={quoteM.isPending}
          onRefresh={() => getQuote(quote.sats)}
        />
        {quoteM.error instanceof Error && <ErrorRow>{quoteM.error.message}</ErrorRow>}
        <KeyValueList
          rows={[
            { k: "You sell", v: `${fmtSats(quote.sats)} sats` },
            { k: "Value", v: fmtLkrExact(quote.grossLkr) },
            {
              k: `Fee (${fmtFeePercent(quote.feeBasisPoints)})`,
              v: `− ${fmtLkrExact(quote.feeLkr)}`,
            },
            { k: "Rate", v: `${fmtLkrExact(quote.btcLkrRate)} / BTC` },
            { k: "Paid to", v: bankLabel },
          ]}
        />
      </>
    );
    footer = (
      <>
        <HoldButton
          label={`Sell for ${fmtLkrExact(quote.amountLkr)}`}
          disabled={expired || quoteM.isPending}
          loading={confirm.isPending}
          onConfirm={() => void onSell()}
        />
        <p className="text-ink3 mt-2 text-center text-[12px] font-semibold">
          {expired
            ? "Refresh the rate to sell"
            : "Press and hold to confirm. You'll approve the payment from your wallet next."}
        </p>
      </>
    );
  }

  return {
    title,
    showKindToggle: current === "amount",
    stepKey: current,
    dir,
    onBack:
      current === "review" && !busy
        ? () => {
            haptic.select();
            go("amount", "back");
          }
        : undefined,
    body,
    footer,
    busy,
  };
}
