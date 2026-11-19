"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { List, ListRow, SectionLabel } from "@/components/ui/section";
import { Sheet } from "@/components/ui/sheet";
import { BigEmoji, SuccessCheck } from "@/components/auth/StatusScreen";
import { Icon } from "@/components/dashboard/settings/icons";
import { useUser } from "@/hooks/useUser";
import { useSession } from "@/hooks/useSession";
import { useKycStatus } from "@/hooks/query/useKyc";
import { haptic, usePlatform } from "@/platform";
import { PushHeader } from "@/components/ui/back-button";
import type { User } from "@/lib/types";

type VerificationStatus = NonNullable<User["kycStatus"]> | null;

const STEPS: { mark: React.ReactNode; title: string; sub: string }[] = [
  { mark: "1", title: "Your details", sub: "Name, contact details and address" },
  {
    mark: "2",
    title: "Your NIC, passport or driving licence",
    sub: "A photo of the front and back",
  },
  { mark: "3", title: "A quick selfie", sub: "Good light, no hats or sunglasses" },
  {
    mark: <Icon name="lock" className="text-success" />,
    title: "Your data is encrypted and never shared",
    sub: "Used only to verify you",
  },
];

const MOBILE_STEPS = [
  "Open Bitcoin Deepa on your phone, in Telegram or your mobile browser",
  "Sign in with the same Telegram account",
  "Start the verification process from there",
];

/** Copy + art for each status that isn't the plain intro. */
const STATUS_CONTENT: Partial<
  Record<NonNullable<VerificationStatus>, { image: string; title: string; description: string }>
> = {
  DECLINED: {
    image: "/emoji/animated/cross-mark.webp",
    title: "Verification declined",
    description: "We couldn't verify your identity. Please try again or contact support.",
  },
  EXPIRED: {
    image: "/emoji/animated/bomb.webp",
    title: "Verification expired",
    description: "Your verification session expired. Please start a new one.",
  },
  ABANDONED: {
    image: "/emoji/animated/coffin.webp",
    title: "Verification not finished",
    description: "You left before finishing. Start again whenever you're ready.",
  },
  KYC_EXPIRED: {
    image: "/emoji/animated/firecracker.webp",
    title: "Your verification expired",
    description: "Your previous verification has expired. Please verify again to keep buying.",
  },
  IN_REVIEW: {
    image: "/emoji/animated/microscope.webp",
    title: "We're reviewing your documents",
    description: "This usually takes up to 24 hours. You'll get a notification once it's done.",
  },
};

const SHOW_STEPS_FOR: VerificationStatus[] = [
  null,
  "NOT_STARTED",
  "IN_PROGRESS",
  "DECLINED",
  "EXPIRED",
  "ABANDONED",
  "KYC_EXPIRED",
];

export default function VerificationIntroPage() {
  const router = useRouter();
  const { id: userId } = useUser();
  // The id comes from the stored token, which the server can't read: wait for
  // the session so the server and first client render agree (hydration).
  const sessionReady = useSession().status !== "loading";
  const platform = usePlatform();
  // Camera-based KYC needs a phone: the Telegram iOS/Android app or a mobile browser.
  const isMobile = platform.isMobileDevice;
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const { data: kycData, refetch: refetchKycStatus } = useKycStatus();

  const status: VerificationStatus = kycData?.status ?? null;
  const verificationUrl = kycData?.url;

  useEffect(() => {
    if (status === "APPROVED") {
      haptic.notify("success");
      const timeout = setTimeout(() => router.push("/dashboard/plans"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  const initiateVerification = () => {
    haptic.impact("medium");
    if (!isMobile) {
      setShowMobileWarning(true);
      return;
    }

    router.push("/verification/details");
  };

  const continueVerification = () => {
    haptic.impact("medium");
    if (!isMobile) {
      setShowMobileWarning(true);
      return;
    }

    if (verificationUrl) {
      platform.openLink(verificationUrl);
    }
  };

  const content = status ? STATUS_CONTENT[status] : undefined;
  const showSteps = SHOW_STEPS_FOR.includes(status);
  const isRetry =
    status === "DECLINED" ||
    status === "EXPIRED" ||
    status === "ABANDONED" ||
    status === "KYC_EXPIRED";

  let action: React.ReactNode;
  if (status === "APPROVED") {
    action = (
      <Button
        onClick={() => {
          haptic.impact("medium");
          router.push("/dashboard/plans");
        }}
      >
        Continue to plans
      </Button>
    );
  } else if (status === "IN_PROGRESS") {
    action = (
      <Button
        onClick={
          verificationUrl
            ? continueVerification
            : () => {
                haptic.impact("medium");
                refetchKycStatus();
              }
        }
      >
        {verificationUrl ? "Continue verification" : "Check verification status"}
      </Button>
    );
  } else if (status === "IN_REVIEW") {
    action = (
      <Button
        variant="secondary"
        onClick={() => {
          haptic.impact("medium");
          router.push("/dashboard");
        }}
      >
        Back to home
      </Button>
    );
  } else {
    action = (
      <Button disabled={showSteps && (!sessionReady || !userId)} onClick={initiateVerification}>
        {isRetry ? "Start new verification" : "Start verification"}
      </Button>
    );
  }

  return (
    <div className="bg-background flex min-h-screen w-full flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-3">
        <PushHeader title="Verify identity" onBack={() => router.push("/dashboard")} />

        {status === "APPROVED" ? (
          <div className="stagger flex flex-col items-center gap-2 px-6 pt-6 text-center">
            <SuccessCheck />
            <h2 className="text-[24px] leading-7">You&apos;re verified</h2>
            <p className="text-ink2 text-[14px]">Taking you to plans…</p>
          </div>
        ) : (
          <div
            key={status ?? "intro"}
            className="stagger flex flex-col items-center gap-2 px-6 pb-2 text-center"
          >
            <BigEmoji src={content?.image ?? "/emoji/animated/id-card.webp"} />
            <h2 className="mt-1 text-[24px] leading-7">
              {content?.title ?? "Verify your identity"}
            </h2>
            <p className="text-ink2 text-[14px] leading-5">
              {content?.description ?? "Complete verification to buy and sell bitcoin"}
            </p>
            {showSteps && (
              <Badge variant="soft" className="mt-1">
                <Icon name="clock" className="size-3.5" />
                Takes less than 2 minutes
              </Badge>
            )}
            {status === "IN_REVIEW" && (
              <Badge variant="pending" className="mt-1">
                <BadgeDot />
                In review
              </Badge>
            )}
          </div>
        )}

        {showSteps && (
          <div className="flex flex-col gap-2">
            <List className="stagger">
              {STEPS.map((step) => (
                <ListRow
                  key={step.title}
                  icon={<span className="text-link text-[15px] font-bold">{step.mark}</span>}
                  title={step.title}
                  subtitle={step.sub}
                />
              ))}
            </List>
            <p className="text-ink3 px-1 text-[12px] leading-4">
              After you submit, our review can take up to 24 hours. We&apos;ll notify you once
              it&apos;s done.
            </p>
          </div>
        )}

        <div className="bg-background sticky bottom-0 mt-auto pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
          {action}
        </div>
      </div>

      <Sheet
        open={showMobileWarning}
        onOpenChange={setShowMobileWarning}
        title="Use your phone"
        footer={
          <Button
            onClick={() => {
              haptic.impact("medium");
              setShowMobileWarning(false);
            }}
          >
            Got it
          </Button>
        }
      >
        <div className="flex flex-col gap-5 px-4 pt-1 pb-2">
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <BigEmoji src="/emoji/animated/exclamation-mark.webp" />
            <h2 className="mt-1 text-[20px] leading-6">Verify on your phone</h2>
            <p className="text-ink2 text-[14px] leading-5">
              Identity verification needs a phone camera, for your security.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <SectionLabel>How to verify on mobile</SectionLabel>
            <List>
              {MOBILE_STEPS.map((step, index) => (
                <ListRow
                  key={step}
                  icon={<span className="text-link text-[15px] font-bold">{index + 1}</span>}
                  title={<span className="text-[14px] leading-[18px] font-semibold">{step}</span>}
                />
              ))}
            </List>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
