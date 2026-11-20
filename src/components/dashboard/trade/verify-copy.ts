import type { KycInfo } from "./flow";

/**
 * Copy for the "verify your identity first" notice on the Buy / Sell amount
 * screen. `cta` is null while it's in review (nothing to do but wait).
 */
export function verifyCopy(status: KycInfo["status"]) {
  switch (status) {
    case "IN_REVIEW":
      return {
        title: "Verification in review",
        text: "You can buy and sell once you're approved.",
        cta: null,
      };
    case "IN_PROGRESS":
      return {
        title: "Finish verifying",
        text: "Pick up where you left off to buy and sell.",
        cta: "Continue",
      };
    case "DECLINED":
    case "EXPIRED":
    case "ABANDONED":
    case "KYC_EXPIRED":
      return {
        title: "Verify again",
        text: "Your last verification didn't go through.",
        cta: "Verify",
      };
    default:
      return {
        title: "Verify your identity",
        text: "Needed once before you buy or sell. Takes about two minutes.",
        cta: "Verify",
      };
  }
}
