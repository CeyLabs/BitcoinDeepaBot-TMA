"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Cell, CellChevron } from "@/components/ui/cell";
import { useKycStatus } from "@/hooks/query/useKyc";
import type { User } from "@/lib/types";
import { haptic } from "@/platform";
import { Section } from "./Section";

type KycStatus = NonNullable<User["kycStatus"]>;

const KYC_BADGE: Record<
  KycStatus,
  { label: string; variant: "active" | "pending" | "negative" | "secondary" }
> = {
  APPROVED: { label: "Verified", variant: "active" },
  IN_REVIEW: { label: "In review", variant: "pending" },
  IN_PROGRESS: { label: "In progress", variant: "pending" },
  DECLINED: { label: "Declined", variant: "negative" },
  NOT_STARTED: { label: "Not started", variant: "secondary" },
  EXPIRED: { label: "Expired", variant: "secondary" },
  KYC_EXPIRED: { label: "Expired", variant: "secondary" },
  ABANDONED: { label: "Not finished", variant: "secondary" },
};

export function KycStatusCell() {
  const router = useRouter();
  const { data, isLoading } = useKycStatus();
  const status = data?.status ?? "NOT_STARTED";
  const badge = KYC_BADGE[status];
  const approved = status === "APPROVED";

  return (
    <Section title="Identity">
      <Cell
        as={approved ? "div" : "button"}
        className="[--cell-py:14px]"
        before={<ShieldCheck size={22} className={approved ? "text-success" : "text-hint"} />}
        subtitle={approved ? "Your identity is verified" : "Needed to buy plans and sell sats"}
        after={
          <span className="flex items-center gap-1">
            {!isLoading && <Badge variant={badge.variant}>{badge.label}</Badge>}
            {!approved && <CellChevron />}
          </span>
        }
        onClick={
          approved
            ? undefined
            : () => {
                haptic.impact("light");
                router.push("/verification");
              }
        }
      >
        KYC verification
      </Cell>
    </Section>
  );
}
