"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { Button, Modal } from "@telegram-apps/telegram-ui";
import { X } from "lucide-react";
import { Drawer } from "@xelene/vaul-with-scroll-fix";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTelegramPlatform } from "@/hooks/useTelegramPlatform";
import { useKycStatus } from "@/hooks/query/useKyc";
import { useTelegramBackButton } from "@/hooks/useTgBackButton";
import { haptic } from "@/lib/haptics";
import type { User } from "@/lib/types";

type VerificationStatus = NonNullable<User["kycStatus"]> | null;

const STEPS = [
  {
    title: "Fill Your Details",
    description: "Provide your basic personal information",
  },
  {
    title: "Capture Your ID",
    description: "National ID, Passport or Driving License",
  },
  {
    title: "Take a Selfie",
    description: "Use good lighting and remove hats or sunglasses.",
  },
  {
    title: "Secure Verification Review",
    description: "Your documents will be securely reviewed.",
  },
];

const MOBILE_STEPS = [
  "Open Telegram on your mobile phone",
  "Navigate to our bot and access the mini app",
  "Start the verification process from there",
];

const STATUS_CONTENT: Record<
  string,
  { image: string; alt: string; title: string; description: string }
> = {
  APPROVED: {
    image: "/emoji/animated/party-popper.webp",
    alt: "Verification Success",
    title: "Verification Complete!",
    description: "Your identity has been successfully verified. Redirecting you now...",
  },
  DECLINED: {
    image: "/emoji/animated/cross-mark.webp",
    alt: "Verification Failed",
    title: "Verification Declined",
    description: "Identity verification was declined. Please contact support or try again.",
  },
  EXPIRED: {
    image: "/emoji/animated/bomb.webp",
    alt: "Verification Expired",
    title: "Verification Expired",
    description: "Your verification session has expired. Please start a new verification.",
  },
  ABANDONED: {
    image: "/emoji/animated/coffin.webp",
    alt: "Verification Abandoned",
    title: "Verification Abandoned",
    description: "Verification process was abandoned. Please try again.",
  },
  KYC_EXPIRED: {
    image: "/emoji/animated/firecracker.webp",
    alt: "Verification Expired",
    title: "KYC Expired",
    description: "Your KYC verification has expired. Please complete verification again.",
  },
  IN_REVIEW: {
    image: "/emoji/animated/microscope.webp",
    alt: "Under Review",
    title: "Verification Under Review",
    description: "You have completed the verification",
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
  const launchParams = useLaunchParams();
  const userData = launchParams.initData?.user;
  const { isMobile } = useTelegramPlatform();
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const { data: kycData, refetch: refetchKycStatus } = useKycStatus();

  const status: VerificationStatus = kycData?.status ?? null;
  const verificationUrl = kycData?.url;

  useTelegramBackButton(() => router.push("/dashboard"));

  useEffect(() => {
    if (status === "APPROVED") {
      haptic.notify("success");
      const timeout = setTimeout(() => router.push("/plans/choose"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  const initiateVerification = () => {
    haptic.impact("light");
    if (!isMobile) {
      setShowMobileWarning(true);
      return;
    }

    router.push("/verification/details");
  };

  const continueVerification = () => {
    haptic.impact("light");
    if (!isMobile) {
      setShowMobileWarning(true);
      return;
    }

    if (verificationUrl) {
      const telegramWebApp = (
        window as unknown as {
          Telegram?: { WebApp?: { openLink?: (url: string) => void } };
        }
      ).Telegram?.WebApp;

      if (telegramWebApp?.openLink) {
        telegramWebApp.openLink(verificationUrl);
      } else {
        window.open(verificationUrl);
      }
    }
  };

  const content = status ? STATUS_CONTENT[status] : undefined;
  const showSteps = SHOW_STEPS_FOR.includes(status);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0b0f14]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-8 pb-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[24px] leading-7 font-bold text-white">
            {content?.title ?? "Verify Your Identity"}
          </h1>
          <p className="text-[14px] leading-4.5 text-[#94a3b8]">
            {content?.description ?? "Complete verification to continue with Bitcoin දීප"}
          </p>
        </div>

        <div className="flex justify-center py-2">
          <Image
            src={content?.image ?? "/emoji/animated/id-card.webp"}
            alt={content?.alt ?? "Identity verification"}
            width={140}
            height={140}
            unoptimized
          />
        </div>

        {showSteps && (
          <div className="flex flex-col gap-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl bg-[#12161d] px-4 py-4">
                <p className="text-[13px] leading-4 font-semibold text-[#fa7119]">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-[16px] leading-5 font-bold text-white">{step.title}</p>
                <p className="mt-0.5 text-[13px] leading-4.25 text-[#94a3b8]">{step.description}</p>
              </div>
            ))}
          </div>
        )}

        {status === "KYC_EXPIRED" && (
          <div className="rounded-2xl bg-[#fa7119]/10 px-4 py-4">
            <p className="text-[13px] leading-4 font-semibold text-[#fa7119]">KYC Expired</p>
            <p className="mt-1 text-[13px] leading-4.5 text-[#94a3b8]">
              Your previous verification has expired, please verify again.
            </p>
          </div>
        )}

        {status === "IN_REVIEW" && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-[#12161d] px-4 py-5 text-center">
            <p className="text-[15px] leading-5 font-bold text-[#fa7119]">
              We&apos;re reviewing your documents.
            </p>
            <p className="text-[16px] leading-5 font-bold text-white">
              This usually takes up to 24 hours.
            </p>
            <p className="text-[13px] leading-4.5 text-[#94a3b8]">
              You&apos;ll receive a notification once approved.
            </p>
          </div>
        )}

        {showSteps && (
          <p className="text-center text-sm font-medium text-white">
            Your Data is Secured and never Shared
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3">
          {showSteps && (
            <p className="text-center text-[12px] text-[#64748b]">Takes less than 2 minutes</p>
          )}

          {status === "APPROVED" ? (
            <Button
              mode="filled"
              size="l"
              stretched
              style={{ borderRadius: "12px" }}
              onClick={() => {
                haptic.impact("light");
                router.push("/plans/choose");
              }}
            >
              Continue to Plans
            </Button>
          ) : status === "IN_PROGRESS" ? (
            <Button
              mode="filled"
              size="l"
              stretched
              style={{ borderRadius: "12px" }}
              onClick={
                verificationUrl
                  ? continueVerification
                  : () => {
                      haptic.impact("light");
                      refetchKycStatus();
                    }
              }
            >
              {verificationUrl ? "Continue Verification" : "Check Verification Status"}
            </Button>
          ) : status === "IN_REVIEW" ? (
            <Button
              mode="outline"
              size="l"
              stretched
              style={
                {
                  borderRadius: "12px",
                  overflow: "hidden",
                  "--tgui--outline": "#fa7119",
                  "--tgui--plain_foreground": "#fa7119",
                } as React.CSSProperties
              }
              onClick={() => {
                haptic.impact("light");
                router.push("/dashboard");
              }}
            >
              Back to Home
            </Button>
          ) : (
            <Button
              mode="filled"
              size="l"
              stretched
              style={{ borderRadius: "12px" }}
              disabled={showSteps && !userData}
              onClick={initiateVerification}
            >
              {status === "DECLINED" ||
              status === "EXPIRED" ||
              status === "ABANDONED" ||
              status === "KYC_EXPIRED"
                ? "Start New Verification"
                : "Start Verification"}
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={showMobileWarning}
        onOpenChange={setShowMobileWarning}
        header={
          <Modal.Header
            after={
              <Modal.Close>
                <X size={20} className="text-[#94a3b8]" />
              </Modal.Close>
            }
          >
            Use Mobile Device
          </Modal.Header>
        }
      >
        <div className="flex flex-col gap-5 px-5 pt-2 pb-6">
          <VisuallyHidden asChild>
            <Drawer.Title>Use Mobile Device</Drawer.Title>
          </VisuallyHidden>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-44 items-center justify-center rounded-full">
              <Image
                src="/emoji/animated/exclamation-mark.webp"
                alt="Warning"
                width={120}
                height={120}
                unoptimized
              />
            </div>
            <h2 className="text-[16px] leading-5 font-bold text-white">Use Mobile Device</h2>
            <p className="text-[14px] leading-4.5 text-[#94a3b8]">
              Identity verification works best on mobile devices for security and camera access.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-[#12161d] px-4 py-4">
            <p className="text-[13px] leading-4 font-semibold text-white">
              How to verify on mobile:
            </p>
            {MOBILE_STEPS.map((step, index) => (
              <div key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fa7119] text-[12px] font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-[13px] leading-4.5 text-[#94a3b8]">{step}</p>
              </div>
            ))}
          </div>

          <Button
            mode="filled"
            size="l"
            stretched
            style={{ borderRadius: "12px" }}
            onClick={() => {
              haptic.impact("light");
              setShowMobileWarning(false);
            }}
          >
            Got It
          </Button>
        </div>
      </Modal>
    </div>
  );
}
