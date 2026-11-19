"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { KeyValueList } from "@/components/ui/section";
import { useBuyPrice, useCreateBuyLink } from "@/hooks/query/useBuy";
import { estimateBuy } from "@/lib/buy";
import { FetchyError } from "@/lib/fetchy";
import { fmtLkrCurrency, fmtLkrExact, fmtSats, LKR_SYMBOL } from "@/lib/formatters";
import { usePayHereRedirect } from "@/lib/hooks";
import { buyAmountSchema } from "@/lib/validations";
import { haptic } from "@/platform";
import { resolveStep, STEP_LABELS, type FlowArgs, type FlowStep, type FlowView } from "./flow";
import {
  AmountBlock,
  AmountDisplay,
  AmountHint,
  applyKey,
  Keypad,
  Presets,
  PriceFooter,
} from "./keypad";
import { ErrorRow, InfoRow, ReviewHeader } from "./parts";
import { VerifyBody, VerifyFooter } from "./VerifyStep";

const PRESETS = [1_000, 2_500, 5_000, 10_000];

export const fmtFeePercent = (bps: number) => `${Number((bps / 100).toFixed(2))}%`;

/**
 * Buy: amount in LKR → (verify) → review → PayHere checkout. The sats are
 * priced when PayHere confirms the payment, so the review shows an estimate
 * (no rate lock). The return lands on /payment/success (BuyOrderStatus).
 */
export function useBuyFlow({ kyc, close }: FlowArgs): FlowView {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<FlowStep>("amount");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [redirectFailed, setRedirectFailed] = useState(false);
  const {
    data: price,
    isError: priceFailed,
    refetch: refetchPrice,
    isFetching: priceFetching,
  } = useBuyPrice();
  const createLink = useCreateBuyLink();
  const { reset: resetCreateLink } = createLink;
  const redirectToPayHere = usePayHereRedirect();

  // Back from PayHere can restore the page from the browser's cache with the
  // button still loading: make it usable again
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) resetCreateLink();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [resetCreateLink]);

  const lkr = Number(amount) || 0;
  const feeBps = price
    ? price.paymentProcessorFeeBasisPoints + price.bitcoindeepaFeeBasisPoints
    : 0;
  const estimate = price
    ? estimateBuy(
        lkr,
        price.paymentProcessorFeeBasisPoints,
        price.bitcoindeepaFeeBasisPoints,
        price.btcLkrPrice
      )
    : null;
  const parsed =
    price && lkr > 0 ? buyAmountSchema(price.minLkr, price.maxLkr).safeParse(lkr) : null;
  const error = parsed && !parsed.success ? parsed.error.issues[0]?.message : undefined;
  const amountOk = !!parsed?.success;

  const steps: FlowStep[] = ["amount", ...(kyc.approved ? [] : ["verify" as const]), "review"];
  const current = resolveStep(step, steps);
  const index = steps.indexOf(current);
  const busy = createLink.isPending || createLink.isSuccess;

  const go = (to: FlowStep, d: "fwd" | "back") => {
    setDir(d);
    setStep(to);
  };

  const onKey = (k: string) => {
    setAmount((a) => applyKey(a, k));
    setRedirectFailed(false);
  };

  const pay = () => {
    // The user must see the fee, estimate and limits before paying
    if (!price || !parsed?.success) return;
    setRedirectFailed(false);
    haptic.impact("medium");
    createLink.mutate(parsed.data, {
      onSuccess: ({ link }) => {
        if (redirectToPayHere(link)) {
          haptic.notify("success");
          return;
        }
        // The checkout is reserved until it expires; a new one can be made
        haptic.notify("error");
        resetCreateLink();
        setRedirectFailed(true);
      },
      onError: (err) => {
        // Backend's KycVerifiedGuard rejects with 403 until KYC is approved
        if (err instanceof FetchyError && err.status === 403) {
          close();
          router.push("/verification");
          return;
        }
        haptic.notify("error");
      },
    });
  };

  let title = "Buy bitcoin";
  let body: React.ReactNode;
  let footer: React.ReactNode;

  if (current === "amount") {
    let hint: string;
    if (error) hint = error;
    else if (lkr > 0 && estimate) hint = `You get ≈ ${fmtSats(estimate.sats)} sats`;
    else if (price)
      hint = `From ${fmtLkrCurrency(price.minLkr)} · up to ${fmtLkrCurrency(price.maxLkr)} at a time`;
    else if (priceFailed) hint = "Couldn't load the current price and fees";
    else hint = "Getting the current price…";

    body = (
      <>
        <AmountBlock>
          <AmountDisplay value={amount} prefix={LKR_SYMBOL} invalid={!!error} />
          <AmountHint invalid={!!error || (priceFailed && !price)}>{hint}</AmountHint>
        </AmountBlock>
        <Presets
          items={PRESETS.filter((v) => !price || (v >= price.minLkr && v <= price.maxLkr)).map(
            (v) => ({
              label: fmtLkrCurrency(v),
              on: lkr === v,
              pick: () => setAmount(String(v)),
            })
          )}
        />
        <Keypad onKey={onKey} />
        {price && (
          <PriceFooter>
            1 BTC ≈ {fmtLkrCurrency(price.btcLkrPrice)} · {fmtFeePercent(feeBps)} fee
          </PriceFooter>
        )}
      </>
    );
    footer =
      priceFailed && !price ? (
        <Button variant="secondary" loading={priceFetching} onClick={() => void refetchPrice()}>
          Try again
        </Button>
      ) : (
        <Button
          disabled={!amountOk}
          loading={kyc.loading && amountOk}
          onClick={() => {
            haptic.impact("light");
            go(steps[index + 1], "fwd");
          }}
        >
          Continue
        </Button>
      );
  } else if (current === "verify") {
    title = "Identity";
    body = <VerifyBody status={kyc.status} />;
    footer = <VerifyFooter status={kyc.status} close={close} />;
  } else {
    title = "Review purchase";
    const showError =
      createLink.error instanceof Error &&
      !(createLink.error instanceof FetchyError && createLink.error.status === 403);
    body =
      price && estimate ? (
        <>
          <ReviewHeader
            caption="You get"
            big={`≈ ${fmtSats(estimate.sats)} sats`}
            small={`for ${fmtLkrCurrency(lkr)}`}
          />
          <InfoRow>An estimate: your sats are priced when PayHere confirms the payment.</InfoRow>
          {redirectFailed && <ErrorRow>Couldn&apos;t open PayHere. Please try again.</ErrorRow>}
          {showError && <ErrorRow>{(createLink.error as Error).message}</ErrorRow>}
          <KeyValueList
            rows={[
              { k: "You pay", v: fmtLkrExact(lkr) },
              { k: `Fees (${fmtFeePercent(feeBps)})`, v: fmtLkrExact(estimate.feeLkr) },
              { k: "Rate", v: `${fmtLkrCurrency(price.btcLkrPrice)} / BTC` },
              { k: "Pay with", v: "PayHere" },
              { k: "Sats go to", v: "Your Bitcoin Deepa wallet" },
            ]}
          />
          <p className="text-ink3 mt-3 px-1 text-center text-[12px] leading-4 font-semibold">
            Up to {fmtLkrCurrency(price.dailyMaxLkr)} a day. You&apos;ll finish paying on
            PayHere&apos;s secure page.
          </p>
        </>
      ) : null;
    footer = (
      <Button loading={busy} disabled={!amountOk} onClick={pay}>
        Pay {fmtLkrCurrency(lkr)} with PayHere
      </Button>
    );
  }

  return {
    title,
    steps: steps.map((s) => STEP_LABELS[s]),
    stepIndex: index,
    showStepper: steps.length > 1,
    showKindToggle: current === "amount",
    stepKey: current,
    dir,
    onBack: index > 0 && !busy ? () => go(steps[index - 1], "back") : undefined,
    body,
    footer,
    busy,
  };
}
