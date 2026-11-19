"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { FreshCredentialPrompt } from "@/components/dashboard/send/FreshCredentialPrompt";
import { useCancelSell, usePaySell, type SellOrder } from "@/hooks/query/useSell";
import { useSecondsLeft } from "@/hooks/useSecondsLeft";
import { TELEGRAM_BOT_URL } from "@/lib/constants";
import { FetchyError } from "@/lib/fetchy";
import { fmtSats } from "@/lib/formatters";
import { isCredentialError, miniAppCanSend } from "@/lib/p2p";
import { haptic, usePlatform } from "@/platform";

/** Title and text for a sale waiting on its payment, by the payment's state. */
export function collectView(order: SellOrder): { title: string; text: string; spinner: boolean } {
  switch (order.collect?.state) {
    case "pending":
      return {
        title: "Approve the payment",
        text: order.collect.payInApp
          ? `Pay ${fmtSats(order.sats)} sats from your wallet to finish this sale. You can also tap ✅ Pay in the bot chat.`
          : `Tap ✅ Pay in the Bitcoin Deepa bot chat to send ${fmtSats(order.sats)} sats and finish this sale.`,
        spinner: false,
      };
    case "awaiting_confirmation":
      return {
        title: "Confirm in the bot chat",
        text: "This payment is above your daily allowance. Tap Confirm in the Bitcoin Deepa bot chat to finish the sale.",
        spinner: false,
      };
    case "requesting":
      return {
        title: "Starting your sale",
        text: "Setting up the payment. This only takes a moment.",
        spinner: true,
      };
    default:
      return {
        title: "Selling your sats",
        text: "Taking the sats from your wallet. This only takes a moment.",
        spinner: true,
      };
  }
}

function fmtCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * The actions of a sale waiting for the user: pay in the app (when the
 * backend allows it), open the bot chat, or cancel before paying.
 */
export function SellApproval({ order }: { order: SellOrder }) {
  const platform = usePlatform();
  const toast = useToast();
  const pay = usePaySell(order.id);
  const cancel = useCancelSell(order.id);
  const [prompt, setPrompt] = useState(false);
  const collect = order.collect;
  const secondsLeft = useSecondsLeft(collect?.expiresAt);

  const onPay = useCallback(async () => {
    // The Mini App's launch data is fixed: past 10 min it can't pay anymore
    if (platform.kind === "telegram" && !miniAppCanSend(platform.launch?.initDataRaw)) {
      setPrompt(true);
      return;
    }
    haptic.impact("medium");
    try {
      await pay.mutateAsync();
      haptic.notify("success");
    } catch (err) {
      if (err instanceof FetchyError && isCredentialError(err.code)) {
        setPrompt(true);
        return;
      }
      if (!(err instanceof FetchyError) || err.status >= 500) {
        // It may have gone through: the page keeps checking the order
        toast({
          title: "Checking your payment",
          description: "We didn't get an answer in time. Checking whether it went through.",
        });
        return;
      }
      haptic.notify("error");
      toast({ type: "error", title: "Payment failed", description: err.message });
    }
  }, [platform, pay, toast]);

  // Web: after logging in again, pay straight away
  const onRenewed = useCallback(() => void onPay(), [onPay]);

  const onCancel = async () => {
    const ok = await platform.confirm({
      title: "Cancel sale",
      message: "Cancel this sale? Nothing will be sold.",
      confirmText: "Cancel sale",
    });
    if (!ok) return;
    try {
      await cancel.mutateAsync();
    } catch (err) {
      toast({
        type: "error",
        title: "Couldn't cancel",
        description: err instanceof Error ? err.message : "Try again.",
      });
    }
  };

  if (!collect) return null;
  const pending = collect.state === "pending";
  const inBot = pending || collect.state === "awaiting_confirmation";

  return (
    <div className="flex flex-col gap-3">
      {pending && secondsLeft > 0 && (
        <p className="text-center text-[13px] font-semibold text-[#64748b] dark:text-[#94a3b8]">
          {fmtCountdown(secondsLeft)} left to pay
        </p>
      )}
      {pending && collect.payInApp && (
        <Button
          size="lg"
          className="w-full rounded-[12px]"
          loading={pay.isPending}
          disabled={pay.isPending || cancel.isPending || secondsLeft === 0}
          onClick={() => void onPay()}
        >
          Pay {fmtSats(order.sats)} sats
        </Button>
      )}
      {inBot && (
        <Button
          variant={pending && collect.payInApp ? "outline" : "default"}
          size="lg"
          className="w-full rounded-[12px]"
          onClick={() => platform.openTelegramLink(TELEGRAM_BOT_URL)}
        >
          Open the bot
        </Button>
      )}
      {pending && (
        <Button
          variant="outline"
          className="w-full rounded-[12px]"
          loading={cancel.isPending}
          disabled={pay.isPending || cancel.isPending}
          onClick={() => void onCancel()}
        >
          Cancel sale
        </Button>
      )}
      <FreshCredentialPrompt
        open={prompt}
        onOpenChange={setPrompt}
        onRenewed={onRenewed}
        action="pay"
      />
    </div>
  );
}
