"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import { FreshCredentialPrompt } from "@/components/dashboard/send/FreshCredentialPrompt";
import { useP2pMe, useP2pSend, useResolveRecipient } from "@/hooks/query/useP2p";
import { FetchyError } from "@/lib/fetchy";
import { fmtSats } from "@/lib/formatters";
import { isCredentialError, miniAppCanSend, recipientLabel, type P2pRecipient } from "@/lib/p2p";
import { sendAmountSchema, sendMemoSchema, sendRecipientSchema } from "@/lib/validations";
import { haptic, usePlatform } from "@/platform";

type Step = "recipient" | "amount" | "review";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
      <span className="text-[#64748b] dark:text-[#94a3b8]">{label}</span>
      <span className="text-right font-medium break-all">{value}</span>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-[#f13131]/10 px-4 py-3">
      <p className="text-[13px] leading-4.5 text-[#f13131]">{message}</p>
    </div>
  );
}

const newPaymentKey = () => crypto.randomUUID();

export default function SendPage() {
  const router = useRouter();
  const platform = usePlatform();
  const toast = useToast();
  const me = useP2pMe();
  const resolve = useResolveRecipient();
  const send = useP2pSend();

  const [step, setStep] = useState<Step>("recipient");
  const [to, setTo] = useState("");
  const [recipient, setRecipient] = useState<P2pRecipient | null>(null);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string>();
  const [renewOpen, setRenewOpen] = useState(false);
  // One key per payment, reused on every retry of it: the bot never sends twice
  const paymentKey = useRef(newPaymentKey());

  const sats = Number(amount.replace(/[,\s]/g, "")) || 0;
  const limits = me.data?.limits;
  const balance = me.data?.balance ?? 0;
  const maxSendable = limits ? Math.min(balance, limits.max_amount, limits.daily_remaining) : 0;
  const needsConfirm = !!limits && sats > limits.unconfirmed_remaining;

  const back = () => {
    setError(undefined);
    if (step === "review") setStep("amount");
    else if (step === "amount") setStep("recipient");
    else router.push("/dashboard");
  };

  const onFindRecipient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = sendRecipientSchema.safeParse(to);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      haptic.notify("error");
      return;
    }
    setError(undefined);
    resolve.mutate(parsed.data, {
      onSuccess: (found) => {
        haptic.impact("light");
        setRecipient(found);
        setStep("amount");
      },
      onError: (err) => {
        haptic.notify("error");
        if (err instanceof FetchyError && isCredentialError(err.code)) setRenewOpen(true);
        setError(err.message);
      },
    });
  };

  const onReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!limits) return;
    const parsedAmount = sendAmountSchema(
      balance,
      limits.max_amount,
      limits.daily_remaining
    ).safeParse(sats || undefined);
    const parsedMemo = sendMemoSchema.safeParse(memo);
    const issue = !parsedAmount.success
      ? parsedAmount.error.issues[0]?.message
      : !parsedMemo.success
        ? parsedMemo.error.issues[0]?.message
        : undefined;
    if (issue) {
      setError(issue);
      haptic.notify("error");
      return;
    }
    setError(undefined);
    // A new payment: a new key (changing the amount or recipient is a new payment)
    paymentKey.current = newPaymentKey();
    setStep("review");
  };

  /** Fresh enough to send? Otherwise ask for a fresh session/login first. */
  const credentialFresh = () =>
    platform.kind === "telegram"
      ? miniAppCanSend(platform.launch?.initDataRaw)
      : !!me.data && Date.now() < new Date(me.data.credential.spend_fresh_until).getTime();

  const doSend = useCallback(async () => {
    if (!recipient) return;
    haptic.impact("heavy");
    try {
      const transfer = await send.mutateAsync({
        to_telegram_id: recipient.telegram_id,
        amount: sats,
        ...(memo.trim() ? { memo: memo.trim() } : {}),
        idempotency_key: paymentKey.current,
      });
      haptic.notify(transfer.status === "failed" ? "error" : "success");
      router.push(`/dashboard/send/${transfer.id}`);
    } catch (err) {
      haptic.notify("error");
      if (err instanceof FetchyError && isCredentialError(err.code)) {
        setRenewOpen(true);
        return;
      }
      // No answer, or it may have gone through: sending again with the same
      // key is safe (the bot returns this payment instead of sending twice)
      const unknown =
        !(err instanceof FetchyError) ||
        err.code === "outcome_unknown" ||
        err.code === "in_progress";
      setError(
        unknown
          ? "We couldn't confirm this payment yet. Tap Send again to check: it won't send twice."
          : err.message
      );
    }
  }, [memo, recipient, router, sats, send]);

  // Stable: the web login button re-injects Telegram's script when it changes
  const onRenewed = useCallback(() => {
    toast({ title: "Logged in", description: "Sending your payment now." });
    void doSend();
  }, [doSend, toast]);

  const onSend = async () => {
    if (!credentialFresh()) {
      setRenewOpen(true);
      return;
    }
    const ok = await platform.confirm({
      title: "Send sats",
      message: `Send ${fmtSats(sats)} sats to ${recipientLabel(recipient ?? undefined)}? This can't be undone.`,
      confirmText: "Send",
    });
    if (ok) await doSend();
  };

  let content: React.ReactNode;
  if (step === "recipient") {
    content = (
      <form onSubmit={onFindRecipient} noValidate className="flex flex-col gap-5">
        <div className="bg-card flex flex-col gap-4 rounded-2xl p-5 [--field-bg:var(--card)]">
          <TextField
            label="To"
            placeholder="@username or Telegram ID"
            autoComplete="off"
            autoCapitalize="none"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setError(undefined);
            }}
            error={error}
          />
          <p className="text-[12px] text-[#94a3b8]">
            They need to have started the Bitcoin Deepa bot.
          </p>
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-[12px]"
          loading={resolve.isPending}
          disabled={!to.trim()}
        >
          Next
        </Button>
      </form>
    );
  } else if (step === "amount" && recipient) {
    content = (
      <form onSubmit={onReview} noValidate className="flex flex-col gap-5">
        <div className="bg-card flex flex-col gap-4 rounded-2xl p-5 [--field-bg:var(--card)]">
          <Row label="To" value={recipientLabel(recipient)} />
          <div className="flex items-center justify-between text-[13px] text-[#64748b] dark:text-[#94a3b8]">
            <span>Available</span>
            <span className="font-semibold">
              {me.isLoading ? "…" : me.data ? `${fmtSats(balance)} sats` : "unavailable"}
            </span>
          </div>
          <div className="relative">
            <TextField
              label="Amount (sats)"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 1,000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^\d,]/g, ""));
                setError(undefined);
              }}
              error={error}
              className="[&_input]:pr-20"
            />
            <button
              type="button"
              disabled={!maxSendable}
              onClick={() => {
                haptic.select();
                setAmount(String(maxSendable));
                setError(undefined);
              }}
              className="bg-primary/10 text-primary absolute top-[17px] right-3 rounded-full px-3 py-1 text-[13px] font-semibold disabled:opacity-40"
            >
              Max
            </button>
          </div>
          <TextField
            label="Note (optional)"
            autoComplete="off"
            maxLength={280}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          {limits && (
            <p className="text-[12px] text-[#94a3b8]">
              Up to {fmtSats(limits.max_amount)} sats per send, {fmtSats(limits.daily_remaining)}{" "}
              more today.
              {needsConfirm ? " You'll confirm this one in the bot chat." : ""}
            </p>
          )}
        </div>
        {me.error instanceof Error && <ErrorBox message={me.error.message} />}
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-[12px]"
          disabled={!sats || !limits}
        >
          Review
        </Button>
      </form>
    );
  } else if (step === "review" && recipient) {
    content = (
      <div className="flex flex-col gap-5">
        <div className="bg-card flex flex-col gap-3 rounded-2xl p-5">
          <div className="flex flex-col items-center gap-1 pb-2 text-center">
            <span className="text-[13px] text-[#64748b] dark:text-[#94a3b8]">You send</span>
            <span className="text-[30px] leading-9 font-bold text-[#1b2027] dark:text-white">
              {fmtSats(sats)} sats
            </span>
          </div>
          <Row label="To" value={recipientLabel(recipient)} />
          {memo.trim() && <Row label="Note" value={memo.trim()} />}
        </div>
        {needsConfirm && (
          <p className="text-center text-[13px] text-[#64748b] dark:text-[#94a3b8]">
            You&apos;ll get a message from the bot to confirm this payment.
          </p>
        )}
        {error && <ErrorBox message={error} />}
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full rounded-[12px]"
            loading={send.isPending}
            onClick={() => void onSend()}
          >
            Send
          </Button>
          <Button
            variant="secondary"
            className="w-full rounded-[12px]"
            disabled={send.isPending}
            onClick={back}
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <BackButton onBack={back} />
      <PageTitle title="Send sats" subtitle="To another Bitcoin Deepa user" />
      {content}
      <FreshCredentialPrompt open={renewOpen} onOpenChange={setRenewOpen} onRenewed={onRenewed} />
    </div>
  );
}
