"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { KeyValueList, SectionLabel } from "@/components/ui/section";
import { Sheet } from "@/components/ui/sheet";
import {
  DualAmount,
  DualHint,
  Presets,
  PriceFooter,
  useDualAmount,
} from "@/components/dashboard/trade/DualAmount";
import { ErrorRow, HoldButton, InfoRow, ReviewHeader } from "@/components/dashboard/trade/parts";
import { ReloginPrompt } from "@/components/auth/ReloginPrompt";
import { isTransferInProgress, SendTransferStatus } from "./SendTransferStatus";
import { useP2pMe, useP2pSend, useP2pTransfer, useRecipient } from "@/hooks/query/useP2p";
import { useUserMe } from "@/hooks/query/useUserMe";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Spinner } from "@/components/ui/button";
import { useSheets } from "@/components/dashboard/sheets";
import { useBotTransactionHistory } from "@/hooks/query/useBotTransactionHistory";
import { useWalletMetrics } from "@/hooks/query/useWalletMetrics";
import { FetchyError } from "@/lib/fetchy";
import { fmtLkrCurrency, fmtSats } from "@/lib/formatters";
import { isReloginError, recipientLabel, type P2pRecipient } from "@/lib/p2p";
import { sendAmountSchema, sendMemoSchema } from "@/lib/validations";
import { normalizeUsername, USERNAME_RULE } from "@/lib/username";
import { haptic } from "@/platform";

/** Who and how much on one screen (like Buy/Sell) → review. */
type Step = "form" | "review";

// randomUUID only exists in secure contexts (https, localhost): a LAN dev URL
// is plain http, so fall back to a v4 UUID from getRandomValues there.
const newPaymentKey = (): string => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

/**
 * Send sats to another Bitcoin Deepa user (P2P): who and how much (typed, in
 * sats or rupees) → review and press-and-hold to send → the transfer's status, polled until it's final.
 * Sending needs a Telegram session under 10 minutes old (reopen the Mini App,
 * or log in again on the web); big amounts are confirmed in the bot chat.
 */
export default function SendSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const me = useP2pMe(open);
  const send = useP2pSend();
  const { currentBtcPrice } = useWalletMetrics();
  const { transactions: botTxs } = useBotTransactionHistory({ enabled: open });

  const [step, setStep] = useState<Step>("form");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [to, setTo] = useState("");
  const [recipient, setRecipient] = useState<P2pRecipient | null>(null);
  const [memo, setMemo] = useState("");
  const [sendError, setSendError] = useState<string>();
  const [transferId, setTransferId] = useState<string | null>(null);
  const [renewOpen, setRenewOpen] = useState(false);
  const lookup = useRecipient(to);
  const { data: myProfile } = useUserMe();
  const { openSettings } = useSheets();
  const { data: transfer } = useP2pTransfer(transferId ?? "");

  // One key per payment, reused on every retry of it: the bot never sends twice
  const paymentKey = useRef(newPaymentKey());

  const limits = me.data?.limits;
  const balance = me.data?.balance ?? 0;
  const maxSendable = limits ? Math.min(balance, limits.max_amount, limits.daily_remaining) : 0;
  const rate = currentBtcPrice || 0; // LKR per BTC
  const lkrFor = (s: number) => (rate > 0 ? (s / 1e8) * rate : 0);
  const d = useDualAmount({
    initial: "sats",
    toSats: (lkr) => (rate > 0 ? Math.floor((lkr / rate) * 1e8) : 0),
    toLkr: (s) => Math.floor(lkrFor(s)),
  });
  const sats = d.sats;
  const parsed =
    d.hasValue && limits
      ? sendAmountSchema(balance, limits.max_amount, limits.daily_remaining).safeParse(sats)
      : null;
  const amountError = parsed && !parsed.success ? parsed.error.issues[0]?.message : undefined;
  const amountOk = !!parsed?.success;
  const needsConfirm = !!limits && sats > limits.unconfirmed_remaining;
  const busy = send.isPending;

  // People you've sent to before (newest first), from the transfer history
  const recents = useMemo(() => {
    const seen = new Set<number>();
    const out: P2pRecipient[] = [];
    for (let i = botTxs.length - 1; i >= 0 && out.length < 6; i--) {
      const tx = botTxs[i];
      if (tx.direction !== "outgoing" || !tx.counterparty_username || seen.has(tx.to_id)) continue;
      seen.add(tx.to_id);
      out.push({
        telegram_id: tx.to_id,
        username: tx.counterparty_username,
        avatar_seed: tx.counterparty_avatar_seed,
      });
    }
    return out;
  }, [botTxs]);

  const go = (next: Step, d: "fwd" | "back") => {
    setDir(d);
    setStep(next);
  };
  const close = () => onOpenChange(false);

  // The member the To field resolved to, once the lookup for what's typed is in
  const found = lookup.settled && lookup.valid ? lookup.data : undefined;
  const toReview = () => {
    if (!found || !amountOk) return;
    const memoCheck = sendMemoSchema.safeParse(memo);
    if (!memoCheck.success) return;
    haptic.impact("light");
    setRecipient(found);
    // A new payment: a new key (changing the amount or recipient is a new payment)
    paymentKey.current = newPaymentKey();
    setSendError(undefined);
    go("review", "fwd");
  };

  const doSend = useCallback(async (): Promise<"relogin" | void> => {
    if (!recipient) return;
    haptic.impact("heavy");
    setSendError(undefined);
    try {
      const t = await send.mutateAsync({
        to_telegram_id: recipient.telegram_id,
        amount: sats,
        ...(memo.trim() ? { memo: memo.trim() } : {}),
        idempotency_key: paymentKey.current,
      });
      haptic.notify(t.status === "failed" ? "error" : "success");
      setTransferId(t.id);
    } catch (err) {
      haptic.notify("error");
      // Not linked on the bot yet: a new login links the wallet, then the user
      // sends again (same payment key, so it can't send twice)
      if (err instanceof FetchyError && isReloginError(err.code)) return "relogin";
      // No answer, or it may have gone through: sending again with the same
      // key is safe (the bot returns this payment instead of sending twice)
      const unknown =
        !(err instanceof FetchyError) ||
        err.code === "outcome_unknown" ||
        err.code === "in_progress";
      setSendError(
        unknown
          ? "We couldn't confirm this payment yet. Hold Send again to check: it won't send twice."
          : err.message
      );
    }
  }, [memo, recipient, sats, send]);

  const onSend = async () => {
    if ((await doSend()) === "relogin") setRenewOpen(true);
  };

  let title = "Send sats";
  let body: React.ReactNode;
  let footer: React.ReactNode;

  if (transferId) {
    const inProgress = isTransferInProgress(transfer);
    title = transfer?.status === "completed" ? "Sent" : inProgress ? "Send sats" : "Payment";
    body = transfer ? (
      <SendTransferStatus transfer={transfer} celebrateOnArrival />
    ) : (
      <div className="flex flex-col items-center gap-1 py-6 text-center">
        <h2 className="text-[22px] leading-7">Sending</h2>
        <p className="text-ink2 text-[14px] font-semibold">One moment…</p>
      </div>
    );
    footer = (
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
            router.push(`/dashboard/send/${transferId}`);
          }}
        >
          {inProgress ? "We'll keep going. Track this payment" : "View payment"}
        </Button>
      </div>
    );
  } else if (step === "form") {
    let amountHint: React.ReactNode;
    if (amountError) amountHint = amountError;
    else if (me.isLoading) amountHint = "Checking your balance…";
    else if (me.data) amountHint = `You have ${fmtSats(balance)} sats`;
    else amountHint = "Your balance couldn't be loaded right now";

    const typed = normalizeUsername(to);
    // Only real messages (lookup, not found, bad format): the placeholder says what to type.
    let note: React.ReactNode = null;
    let bad = false;
    if (typed && !lookup.valid && lookup.settled) {
      note = USERNAME_RULE;
      bad = true;
    } else if (lookup.valid && (!lookup.settled || lookup.isFetching) && !found) {
      note = (
        <span className="inline-flex items-center gap-1.5">
          <Spinner className="size-3" /> Looking up @{typed}…
        </span>
      );
    } else if (lookup.valid && lookup.error) {
      note = lookup.error.message;
      bad = true;
    }

    body = (
      <div className="flex flex-col gap-4 pt-1">
        <div>
          <SectionLabel as="label" className="mb-2 block">
            <span id="send-to-label">To</span>
          </SectionLabel>
          <div className="bg-chip flex h-[52px] items-center gap-1.5 rounded-xl px-3.5 focus-within:shadow-[0_0_0_2px_var(--ring)]">
            <span aria-hidden className="text-ink3 text-[18px] font-bold">
              @
            </span>
            <input
              aria-labelledby="send-to-label"
              aria-describedby={note ? "send-to-note" : undefined}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={21}
              placeholder="BitcoinDeepa username"
              value={to.replace(/^@+/, "").toLowerCase()}
              onChange={(e) => setTo(e.target.value)}
              className="text-foreground placeholder:text-ink3 h-full min-w-0 grow border-0 bg-transparent p-0 text-[17px] font-semibold outline-none placeholder:font-medium"
            />
          </div>
          {found ? (
            <div className="bg-chip mt-2 flex items-center gap-3 rounded-xl p-2.5 pr-3.5">
              <UserAvatar seed={found.avatar_seed || String(found.telegram_id)} size={40} />
              <span className="min-w-0 grow">
                <span className="block truncate text-[15px] leading-[18px] font-bold">
                  {found.name || `@${found.username}`}
                </span>
                <span className="text-ink3 block truncate text-[13px] leading-4">
                  @{found.username}
                </span>
              </span>
              <svg
                className="text-success size-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
          ) : (
            note && (
              <p
                id="send-to-note"
                aria-live="polite"
                className={cn(
                  "mt-1.5 text-[12px] leading-4 font-semibold",
                  bad ? "text-loss" : "text-ink3"
                )}
              >
                {note}
              </p>
            )
          )}
        </div>
        {/* Picked: the recipient card says who, so the row would only make the sheet scroll. */}
        {recents.length > 0 && !found && (
          <div>
            <SectionLabel className="mb-2">Recent</SectionLabel>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-0.5">
              {recents.map((r) => (
                <button
                  key={r.telegram_id}
                  type="button"
                  aria-pressed={typed === r.username}
                  onClick={() => {
                    haptic.select();
                    setTo(r.username ?? "");
                  }}
                  className={cn(
                    "press flex h-[52px] shrink-0 items-center gap-2 rounded-xl border-0 py-0 pr-3.5 pl-2 text-left",
                    typed === r.username ? "bg-nav-sel" : "bg-chip"
                  )}
                >
                  <UserAvatar seed={r.avatar_seed || String(r.telegram_id)} size={36} />
                  <span className="text-[13px] leading-4 font-bold whitespace-nowrap">
                    @{r.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <DualAmount
            id="send"
            d={d}
            top={{ unit: "sats", label: "You send" }}
            bottom={{ unit: "lkr", label: "Worth" }}
            onSubmit={toReview}
            invalid={!!amountError}
          />
          <DualHint invalid={!!amountError || (!me.isLoading && !me.data)}>{amountHint}</DualHint>
          <Presets
            items={[1000, 5000, 10000]
              .map((v) => ({
                label: `${fmtSats(v)} sats`,
                on: d.active === "sats" && sats === v,
                disabled: !limits || v > maxSendable,
                pick: () => d.set("sats", v),
              }))
              .concat({
                label: "Max",
                on: d.active === "sats" && maxSendable > 0 && sats === maxSendable,
                disabled: maxSendable <= 0,
                pick: () => d.set("sats", maxSendable),
              })}
          />
          {me.error instanceof Error && (
            <div className="pt-2">
              <ErrorRow>{me.error.message}</ErrorRow>
            </div>
          )}
          {limits && (
            <PriceFooter>
              Up to {fmtSats(limits.max_amount)} sats per send · {fmtSats(limits.daily_remaining)}{" "}
              more today
            </PriceFooter>
          )}
        </div>
        {myProfile && !myProfile.username && (
          <button
            type="button"
            onClick={() => {
              haptic.select();
              close();
              // Let this sheet slide away before the settings sheet comes up
              window.setTimeout(openSettings, 260);
            }}
            className="press text-link self-start border-0 bg-transparent p-0 text-left text-[13px] font-semibold"
          >
            Claim your own @username so others can send to you ›
          </button>
        )}
      </div>
    );
    footer = (
      <Button disabled={!found || !amountOk} onClick={toReview}>
        {found && amountOk ? `Review · ${fmtSats(sats)} sats` : "Review"}
      </Button>
    );
  } else if (step === "review" && recipient) {
    title = "Review";
    const memoError = sendMemoSchema.safeParse(memo).success
      ? undefined
      : "Keep the note under 280 characters";
    body = (
      <>
        <ReviewHeader
          caption="You send"
          big={`${fmtSats(sats)} sats`}
          small={rate > 0 ? `≈ ${fmtLkrCurrency(Math.round(lkrFor(sats)))}` : undefined}
        />
        {needsConfirm && (
          <InfoRow>You&apos;ll confirm this payment in the Bitcoin Deepa bot chat.</InfoRow>
        )}
        {sendError && <ErrorRow>{sendError}</ErrorRow>}
        <KeyValueList
          className="mb-3"
          rows={[
            { k: "To", v: recipientLabel(recipient) },
            { k: "Amount", v: `${fmtSats(sats)} sats` },
            ...(rate > 0
              ? [{ k: "Value", v: `≈ ${fmtLkrCurrency(Math.round(lkrFor(sats)))}` }]
              : []),
            ...(limits
              ? [
                  {
                    k: "Left today after this",
                    v: `${fmtSats(Math.max(0, limits.daily_remaining - sats))} sats`,
                  },
                ]
              : []),
          ]}
        />
        <label className="text-ink2 mb-2 block text-[14px] leading-4 font-bold" htmlFor="send-memo">
          Note <span className="text-ink3 font-normal">(optional)</span>
        </label>
        <input
          id="send-memo"
          autoComplete="off"
          maxLength={280}
          placeholder="What's it for?"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="bg-chip text-foreground placeholder:text-ink3 h-[52px] w-full rounded-xl border-0 px-3.5 text-[16px] font-semibold outline-none focus:shadow-[0_0_0_2px_var(--ring)]"
        />
        {memoError && <p className="text-loss mt-1.5 text-[12px] font-semibold">{memoError}</p>}
      </>
    );
    footer = (
      <>
        <HoldButton
          label={`Send ${fmtSats(sats)} sats`}
          disabled={!!memoError}
          loading={send.isPending}
          onConfirm={() => void onSend()}
        />
        <p className="text-ink3 mt-2 text-center text-[12px] font-semibold">
          Press and hold to send. This can&apos;t be undone.
        </p>
      </>
    );
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          // Don't drop a send mid-flight
          if (!next && busy) return;
          onOpenChange(next);
        }}
        title={title}
        onBack={
          !transferId && step === "review" && !busy
            ? () => {
                haptic.select();
                go("form", "back");
              }
            : undefined
        }
        hideClose={busy}
        footer={footer}
      >
        <div
          key={transferId ? "status" : step}
          className={cn("px-4", dir === "back" ? "animate-in-left" : "animate-in-right")}
        >
          {body}
        </div>
      </Sheet>
      <ReloginPrompt open={renewOpen} onOpenChange={setRenewOpen} />
    </>
  );
}
