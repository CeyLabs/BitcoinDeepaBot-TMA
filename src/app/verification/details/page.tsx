"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useKycInitiate, useUpdateProfile } from "@/hooks/query/useKyc";
import { haptic } from "@/platform";
import { BackButton } from "@/components/ui/back-button";
import { useUser } from "@/hooks/useUser";
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
  const { id: userId, username, firstName, lastName } = useUser();
  const kycInitiate = useKycInitiate();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      first_name: firstName ?? "",
      last_name: lastName ?? "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Sri Lanka",
    },
  });

  const error =
    updateProfile.error instanceof Error
      ? updateProfile.error.message
      : kycInitiate.error instanceof Error
        ? kycInitiate.error.message
        : null;

  const onSubmit = (formData: CreateUserFormData) => {
    haptic.impact("medium");
    updateProfile.mutate(
      {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
      },
      {
        onSuccess: () => {
          kycInitiate.mutate(
            {
              user_id: userId ? Number(userId) : undefined,
              username,
              ...formData,
            },
            {
              onSuccess: (result) => {
                if (result.url) {
                  window.location.href = result.url;
                }
              },
              onError: () => haptic.notify("error"),
            }
          );
        },
        onError: () => haptic.notify("error"),
      }
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f7f9fc] dark:bg-[#0b0f14]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-8 pb-6">
        <BackButton
          onBack={() => router.push("/verification")}
          className="bg-white text-[#1b2027] dark:bg-white/10 dark:text-white"
        />
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[24px] leading-7 font-bold text-[#1b2027] dark:text-white">
            Your Details
          </h1>
          <p className="text-[14px] leading-4.5 text-[#64748b] dark:text-[#94a3b8]">
            We need a few details before starting verification
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-5 [--field-bg:#f7f9fc] dark:[--field-bg:#0b0f14]">
            {FIELDS.map((field) => (
              <TextField
                key={field.name}
                type={field.type}
                label={
                  <span className="inline-flex items-center gap-1">
                    {field.label}
                    <span className="size-1 rounded-full bg-[#f13131]" />
                  </span>
                }
                placeholder={field.placeholder}
                error={errors[field.name]?.message}
                {...register(field.name)}
              />
            ))}
          </div>

          {error && (
            <div className="rounded-2xl bg-[#f13131]/10 px-4 py-4">
              <p className="text-[13px] leading-4 font-semibold text-[#f13131]">
                Verification Error
              </p>
              <p className="mt-1 text-[13px] leading-4.5 text-[#64748b] dark:text-[#94a3b8]">
                {error}
              </p>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-4">
            <Button
              className="w-full rounded-[12px]"
              type="submit"
              size="lg"
              loading={updateProfile.isPending || kycInitiate.isPending}
              disabled={updateProfile.isPending || kycInitiate.isPending || !isValid}
            >
              Start Verification
            </Button>
            <p className="text-center text-xs text-[#64748b] dark:text-[#94a3b8]">
              Your Data is Encrypted and never Shared
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
