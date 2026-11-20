import type { KycStatusResponse } from "@/hooks/query/useKyc";

/** Amount (with any verify / bank notice inline) → review. */
export type FlowStep = "amount" | "review";

export interface KycInfo {
  status: KycStatusResponse["status"] | undefined;
  loading: boolean;
  approved: boolean;
}

/** What a Buy or Sell flow tells the sheet to render. */
export interface FlowView {
  title: string;
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
  /** The sheet is open: live prices only poll while it is. */
  open: boolean;
  /** Closes the sheet. */
  close: () => void;
}
