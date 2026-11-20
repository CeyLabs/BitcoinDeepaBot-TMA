"use client";

import { useToast } from "@/components/ui/toast";
import { useCancelSubscription } from "@/hooks/query/useCancelSubscription";
import { haptic, usePlatform } from "@/platform";

/**
 * Asks, then cancels the current plan. `reason: "switch"` is the change-plan
 * path: a member has one plan at a time, so the old one goes first.
 * Resolves true once cancelled.
 */
export function useCancelPlan() {
  const platform = usePlatform();
  const toast = useToast();
  const mutation = useCancelSubscription();

  const cancel = async (planName: string | undefined, reason: "cancel" | "switch") => {
    const name = planName ?? "your plan";
    haptic.impact("light");
    const confirmed = await platform.confirm(
      reason === "switch"
        ? {
            title: "Cancel your plan first?",
            message: `You can have one plan at a time. Cancel ${name} now, then pick your new plan. Your sats stay in your wallet.`,
            confirmText: `Cancel ${name}`,
            cancelText: "Keep it",
            destructive: true,
          }
        : {
            title: "Cancel plan?",
            message: `${name} stops right away and this can't be undone. Your sats stay in your wallet.`,
            confirmText: "Cancel plan",
            cancelText: "Keep it",
            destructive: true,
          }
    );
    if (!confirmed) return false;

    haptic.impact("rigid");
    try {
      // Invalidates the current subscription: the Plans tab turns into the picker.
      await mutation.mutateAsync();
      haptic.notify("success");
      toast({
        type: "success",
        title: "Plan cancelled",
        description: reason === "switch" ? "Now pick your new plan." : undefined,
      });
      return true;
    } catch (err) {
      haptic.notify("error");
      toast({
        type: "error",
        title: "Couldn't cancel the plan",
        description: err instanceof Error ? err.message : "Try again in a moment.",
      });
      return false;
    }
  };

  return { cancel, cancelling: mutation.isPending };
}
