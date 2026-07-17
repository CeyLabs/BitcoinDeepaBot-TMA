"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBackButton, useLaunchParams } from "@telegram-apps/sdk-react";
import { Button, Input } from "@telegram-apps/telegram-ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useKycInitiate } from "@/hooks/query/useKyc";
import { createUserSchema, type CreateUserFormData } from "@/lib/validations";

const FIELDS: Array<{
  name: keyof CreateUserFormData;
  label: string;
  placeholder: string;
  type: string;
}> = [
  { name: "first_name", label: "First Name", placeholder: "Enter your first name", type: "text" },
  { name: "last_name", label: "Last Name", placeholder: "Enter your last name", type: "text" },
  { name: "email", label: "Email", placeholder: "e.g. example@gmail.com", type: "email" },
  { name: "phone", label: "Phone", placeholder: "e.g. +94771234567", type: "tel" },
  { name: "address", label: "Address", placeholder: "Enter your address", type: "text" },
  { name: "city", label: "City", placeholder: "e.g. Colombo", type: "text" },
  { name: "country", label: "Country", placeholder: "e.g. Sri Lanka", type: "text" },
];

export default function VerificationDetailsPage() {
  const router = useRouter();
  const backButton = useBackButton();
  const launchParams = useLaunchParams();
  const userData = launchParams.initData?.user;
  const kycInitiate = useKycInitiate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      first_name: userData?.firstName ?? "",
      last_name: userData?.lastName ?? "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Sri Lanka",
    },
  });

  useEffect(() => {
    backButton.show();
    const handleBackClick = () => router.push("/v2/verification");
    backButton.on("click", handleBackClick);
    return () => {
      backButton.off("click", handleBackClick);
      backButton.hide();
    };
  }, [backButton, router]);

  const error = kycInitiate.error instanceof Error ? kycInitiate.error.message : null;

  const onSubmit = (formData: CreateUserFormData) => {
    kycInitiate.mutate(
      {
        user_id: userData?.id,
        username: userData?.username,
        ...formData,
      },
      {
        onSuccess: (result) => {
          if (result.url) {
            window.location.href = result.url;
          }
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0b0f14]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-6 pt-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[24px] font-bold leading-7 text-white">Your Details</h1>
          <p className="text-[14px] leading-4.5 text-[#94a3b8]">
            We need a few details before starting verification
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-3">
          <div
            className="flex flex-col gap-3"
            style={{ "--tgui--bg_color": "#0b0f14" } as React.CSSProperties}
          >
            {FIELDS.map((field) => (
              <div key={field.name} className="w-full">
                <Input
                  type={field.type}
                  status={errors[field.name] ? "error" : undefined}
                  header={
                    <span className="inline-flex items-center gap-1">
                      {field.label}
                      <span className="size-1 rounded-full bg-[#f13131]" />
                    </span>
                  }
                  placeholder={field.placeholder}
                  className="w-full p-0"
                  {...register(field.name)}
                />
                {errors[field.name] && (
                  <p className="pl-6 pt-1 text-[12px] text-[#f13131]">
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-2xl bg-[#f13131]/10 px-4 py-4">
              <p className="text-[13px] font-semibold leading-4 text-[#f13131]">
                Verification Error
              </p>
              <p className="mt-1 text-[13px] leading-4.5 text-[#94a3b8]">{error}</p>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              mode="filled"
              size="l"
              stretched
              style={{ borderRadius: "12px" }}
              loading={kycInitiate.isPending}
              disabled={kycInitiate.isPending || !isValid}
            >
              Start Verification
            </Button>
            <p className="text-center text-xs text-muted">
              Your Data is Encrypted and never Shared
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
