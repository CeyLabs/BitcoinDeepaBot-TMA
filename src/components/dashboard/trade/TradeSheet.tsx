"use client";

import { useCallback, useState } from "react";
import { cn } from "cn";
import { Segmented } from "@/components/ui/segmented";
import { Sheet, SheetStepper } from "@/components/ui/sheet";
import { useKycStatus } from "@/hooks/query/useKyc";
import type { TradeKind } from "../sheets";
import type { KycInfo } from "./flow";
import { useBuyFlow } from "./useBuyFlow";
import { useSellFlow } from "./useSellFlow";

const KINDS = [
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
] as const;

/** Buy / Sell keypad flow in a bottom sheet (wallet quick actions). */
export default function TradeSheet({
  open,
  onOpenChange,
  initialKind,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialKind: TradeKind;
}) {
  const [kind, setKind] = useState<TradeKind>(initialKind);
  const { data: kycData, isLoading: kycLoading } = useKycStatus();
  const kyc: KycInfo = {
    status: kycData?.status,
    loading: kycLoading,
    approved: kycData?.status === "APPROVED",
  };
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Both flows stay mounted so switching keeps each one's amount and prices.
  const buy = useBuyFlow({ kyc, close });
  const sell = useSellFlow({ kyc, close });
  const flow = kind === "buy" ? buy : sell;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        // Don't drop a request mid-flight (checkout link, sale confirm)
        if (!next && flow.busy) return;
        onOpenChange(next);
      }}
      title={flow.title}
      onBack={flow.onBack}
      hideClose={flow.busy}
      footer={flow.footer}
      flow
    >
      {flow.showStepper && <SheetStepper steps={flow.steps} current={flow.stepIndex} />}
      {flow.showKindToggle && (
        <div className="px-4">
          <Segmented options={KINDS} value={kind} onChange={setKind} label="Buy or sell" />
        </div>
      )}
      <div
        key={`${kind}-${flow.stepKey}`}
        className={cn("px-4", flow.dir === "back" ? "animate-in-left" : "animate-in-right")}
      >
        {flow.body}
      </div>
    </Sheet>
  );
}
