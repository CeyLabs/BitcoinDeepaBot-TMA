"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { List, ListRow } from "@/components/ui/section";
import type { KycInfo } from "./flow";
import { BigEmoji } from "./parts";

function copyFor(status: KycInfo["status"]) {
  switch (status) {
    case "IN_REVIEW":
      return {
        title: "Verification in review",
        text: "We're checking your documents. You can buy and sell once you're approved.",
        cta: "View status",
        rows: false,
      };
    case "IN_PROGRESS":
      return {
        title: "Finish verifying",
        text: "Pick up where you left off to buy and sell bitcoin.",
        cta: "Continue verification",
        rows: true,
      };
    case "DECLINED":
    case "EXPIRED":
    case "ABANDONED":
    case "KYC_EXPIRED":
      return {
        title: "Verify your identity",
        text: "Your last verification didn't go through. Verify again to buy and sell bitcoin.",
        cta: "Verify again",
        rows: true,
      };
    default:
      return {
        title: "Verify your identity",
        text: "Complete verification to buy and sell bitcoin",
        cta: "Start verification",
        rows: true,
      };
  }
}

/** Verify step: why we need it, and a button to our real /verification flow. */
export function VerifyBody({ status }: { status: KycInfo["status"] }) {
  const copy = copyFor(status);
  return (
    <div className="flex flex-col gap-4">
      <div className="stagger flex flex-col items-center gap-2 px-5 text-center">
        <BigEmoji src="/emoji/animated/id-card.webp" />
        <h2 className="text-[24px] leading-7">{copy.title}</h2>
        <p className="text-ink2 text-[14px]">{copy.text}</p>
      </div>
      {copy.rows && (
        <List>
          <ListRow
            icon={<span className="text-link font-bold">1</span>}
            title="Your NIC or passport"
            subtitle="A photo of your ID document"
          />
          <ListRow
            icon={<span className="text-link font-bold">2</span>}
            title="A quick selfie"
            subtitle="Works best on your phone camera"
          />
          <ListRow
            icon={
              <svg
                className="text-gain size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            }
            title="Used only to verify you"
            subtitle="Needed once before you buy or sell"
          />
        </List>
      )}
    </div>
  );
}

export function VerifyFooter({ status, close }: { status: KycInfo["status"]; close: () => void }) {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        close();
        router.push("/verification");
      }}
    >
      {copyFor(status).cta}
    </Button>
  );
}
