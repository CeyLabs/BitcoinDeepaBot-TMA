import type { KycStatusResponse } from "@/hooks/query/useKyc";

export type FlowStep = "amount" | "verify" | "bank" | "review";

const ORDER: FlowStep[] = ["amount", "verify", "bank", "review"];

export const STEP_LABELS: Record<FlowStep, string> = {
  amount: "Amount",
  verify: "Verify",
  bank: "Bank",
  review: "Review",
};

/**
 * The step to show: `step` itself, or the next one in the flow if `step` no
 * longer applies (e.g. KYC got approved while the Verify step was open).
 */
export function resolveStep(step: FlowStep, steps: FlowStep[]): FlowStep {
  if (steps.includes(step)) return step;
  const at = ORDER.indexOf(step);
  return steps.find((s) => ORDER.indexOf(s) > at) ?? steps[steps.length - 1];
}

export interface KycInfo {
  status: KycStatusResponse["status"] | undefined;
  loading: boolean;
  approved: boolean;
}

/** What a Buy or Sell flow tells the sheet to render. */
export interface FlowView {
  title: string;
  /** Stepper labels; the stepper shows when there's more than one. */
  steps: string[];
  stepIndex: number;
  showStepper: boolean;
  /** The Buy | Sell toggle (amount step only). */
  showKindToggle: boolean;
  /** Changes when the body should animate in. */
  stepKey: string;
  dir: "fwd" | "back";
  onBack?: () => void;
  body: React.ReactNode;
  footer?: React.ReactNode;
  /** A request is in flight: the sheet can't be closed. */
  busy: boolean;
}

export interface FlowArgs {
  kyc: KycInfo;
  /** Closes the sheet. */
  close: () => void;
}
