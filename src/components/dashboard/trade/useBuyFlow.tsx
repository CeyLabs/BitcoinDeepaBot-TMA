"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { KeyValueList } from "@/components/ui/section";
import { useBuyPrice, useCreateBuyLink } from "@/hooks/query/useBuy";
import { estimateBuy } from "@/lib/buy";
import { FetchyError } from "@/lib/fetchy";
import { fmtLkrCurrency, fmtLkrExact, fmtSats } from "@/lib/formatters";
import { usePayHereRedirect } from "@/lib/hooks";
import { buyAmountSchema } from "@/lib/validations";
import { haptic } from "@/platform";
import type { FlowArgs, FlowStep, FlowView } from "./flow";
import {
  DualAmount,
  DualHint,
  GateNotice,
  Presets,
  PriceFooter,
  useDualAmount,
} from "./DualAmount";
import { ErrorRow, ReviewHeader, WarningRow } from "./parts";
import { verifyCopy } from "./verify-copy";

const PRESETS = [1_000, 2_500, 5_000, 10_000];

export const fmtFeePercent = (bps: number) => `${Number((bps / 100).toFixed(2))}%`;

/**
 * Buy: amount (rupees only; sats shown as an estimate) → review → PayHere checkout. Until KYC is
 * approved the amount screen shows a verify notice and can't continue. The sats are
 * priced when PayHere confirms the payment, so the review shows an estimate
 * (no rate lock). The return lands on /payment/success (BuyOrderStatus).
 */
export function useBuyFlow({ kyc, close, open }: FlowArgs): FlowView {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>("amount");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [redirectFailed, setRedirectFailed] = useState(false);
  const {
    data: price,
    isError: priceFailed,
    refetch: refetchPrice,
    isFetching: priceFetching,
  } = useBuyPrice(open);
  const createLink = useCreateBuyLink();
  const { reset: resetCreateLink } = createLink;
  const redirectToPayHere = usePayHereRedirect();

  // Back from PayHere can restore this page from the browser's cache (Safari
  // does even with no-store), sheet and all. Once a checkout was opened, close
  // the sheet and show that purchase's status (paid, pending or not paid)
  // instead of leaving the sheet over it; otherwise make Pay usable again.
  const checkoutOrderId = useRef<string | null>(null);
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      resetCreateLink();
      const orderId = checkoutOrderId.current;
      if (!orderId) return;
      checkoutOrderId.current = null;
      close();
      router.replace(`/dashboard/buy?buy_order=${encodeURIComponent(orderId)}`);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [resetCreateLink, close, router]);

  const feeBps = price
    ? price.paymentProcessorFeeBasisPoints + price.bitcoindeepaFeeBasisPoints
    : 0;
  const d = useDualAmount({
    initial: "lkr",
    toSats: (lkr) =>
      price
        ? estimateBuy(
            lkr,
            price.paymentProcessorFeeBasisPoints,
            price.bitcoindeepaFeeBasisPoints,
            price.btcLkrPrice
          ).sats
        : 0,
  });
  const lkr = d.lkr;
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

  // KYC can lapse while the review is open: back to the amount screen and its notice.
  const current: FlowStep = step === "review" && kyc.approved ? "review" : "amount";
  const busy = createLink.isPending || createLink.isSuccess;

  const go = (to: FlowStep, d: "fwd" | "back") => {
    setDir(d);
    setStep(to);
  };

  const toReview = () => {
    if (!amountOk || !kyc.approved) return;
    haptic.impact("light");
    setRedirectFailed(false);
    go("review", "fwd");
  };

  const pay = () => {
    // The user must see the fee, estimate and limits before paying
    if (!price || !parsed?.success) return;
    setRedirectFailed(false);
    haptic.impact("medium");
    createLink.mutate(parsed.data, {
      onSuccess: ({ link, order_id }) => {
        if (redirectToPayHere(link)) {
          checkoutOrderId.current = order_id;
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
    else if (price)
      hint = `From ${fmtLkrCurrency(price.minLkr)} · up to ${fmtLkrCurrency(price.maxLkr)} at a time`;
    else if (priceFailed) hint = "Couldn't load the current price and fees";
    else hint = "Getting the current price…";
    const gate = !kyc.loading && !kyc.approved ? verifyCopy(kyc.status) : null;

    body = (
      <div className="pt-3">
        {gate && (
          <GateNotice
            title={gate.title}
            text={gate.text}
            action={
              gate.cta
                ? {
                    label: gate.cta,
                    onClick: () => {
                      close();
                      router.push("/verification");
                    },
                  }
                : undefined
            }
          />
        )}
        <DualAmount
          id="buy"
          d={d}
          top={{ unit: "lkr", label: "You pay" }}
          bottom={{ unit: "sats", label: "You get" }}
          // Only rupees: the sats are priced when PayHere confirms the payment.
          only="lkr"
          onSubmit={toReview}
          invalid={!!error}
        />
        <DualHint invalid={!!error || (priceFailed && !price)}>{hint}</DualHint>
        <Presets
          items={PRESETS.filter((v) => !price || (v >= price.minLkr && v <= price.maxLkr)).map(
            (v) => ({
              label: fmtLkrCurrency(v),
              on: d.active === "lkr" && lkr === v,
              pick: () => {
                d.set("lkr", v);
                setRedirectFailed(false);
              },
            })
          )}
        />
        {price && (
          <PriceFooter>
            1 BTC ≈ {fmtLkrCurrency(price.btcLkrPrice)} · {fmtFeePercent(feeBps)} fee
          </PriceFooter>
        )}
      </div>
    );
    footer =
      priceFailed && !price ? (
        <Button variant="secondary" loading={priceFetching} onClick={() => void refetchPrice()}>
          Try again
        </Button>
      ) : (
        <Button
          disabled={!amountOk || !kyc.approved}
          loading={kyc.loading && amountOk}
          onClick={toReview}
        >
          Review
        </Button>
      );
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
          <WarningRow title="This is an estimate">
            The BTC price is set when PayHere confirms your payment, so you may get a few more or
            fewer sats than shown.
          </WarningRow>
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
            {`Up to ${fmtLkrCurrency(price.dailyMaxLkr)} a day. You'll finish paying on PayHere's secure page.`}
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
    showKindToggle: current === "amount",
    stepKey: current,
    dir,
    onBack: current === "review" && !busy ? () => go("amount", "back") : undefined,
    body,
    footer,
    busy,
  };
}
