"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBackButton } from "@telegram-apps/sdk-react";
import { Button } from "@/components/ui/button";

const STEPS = [
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

export default function VerificationIntroPage() {
  const router = useRouter();
  const backButton = useBackButton();

  useEffect(() => {
    backButton.show();
    const handleBackClick = () => router.push("/v2/dashboard");
    backButton.on("click", handleBackClick);
    return () => {
      backButton.off("click", handleBackClick);
      backButton.hide();
    };
  }, [backButton, router]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0b0f14]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-6 pt-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[24px] font-bold leading-7 text-white">Verify Your Identity</h1>
          <p className="text-[14px] leading-4.5 text-[#94a3b8]">
            Complete verification to continue with Bitcoin දීප
          </p>
        </div>

        <div className="flex justify-center py-2">
          <Image
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Identification%20Card.webp"
            alt="Identity verification"
            width={140}
            height={140}
            unoptimized
          />
        </div>

        <div className="flex flex-col gap-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl bg-[#12161d] px-4 py-4"
            >
              <p className="text-[13px] font-semibold leading-4 text-[#fa7119]">
                Step {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[16px] font-bold leading-5 text-white">{step.title}</p>
              <p className="mt-0.5 text-[13px] leading-4.25 text-[#94a3b8]">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[14px] font-medium text-white">
          Your Data is Encrypted and never Shared
        </p>

        <div className="mt-auto flex flex-col gap-3">
          <p className="text-center text-[12px] text-[#64748b]">Takes less than 2 minutes</p>
          <Button variant="primary" onClick={() => router.push("/verification")}>
            Start Verification
          </Button>
        </div>
      </div>
    </div>
  );
}
