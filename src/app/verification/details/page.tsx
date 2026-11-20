"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useKycInitiate, useUpdateProfile } from "@/hooks/query/useKyc";
import { haptic } from "@/platform";
import { PushHeader } from "@/components/ui/back-button";
import { SectionLabel } from "@/components/ui/section";
import { Icon } from "@/components/dashboard/settings/icons";
import { useUser } from "@/hooks/useUser";
import { useUserMe } from "@/hooks/query/useUserMe";
import { createUserSchema, type CreateUserFormData } from "@/lib/validations";

type FieldName = keyof CreateUserFormData;
type FieldErrors = Partial<Record<FieldName, string>>;

/** First zod message for one field, or undefined when it's valid. */
function fieldError(name: FieldName, value: string) {
  const result = createUserSchema.shape[name].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

const FIELDS: Array<{
  name: keyof CreateUserFormData;
  label: string;
  placeholder: string;
  type: string;
}> = [
  { name: "first_name", label: "First name", placeholder: "Enter your first name", type: "text" },
  { name: "last_name", label: "Last name", placeholder: "Enter your last name", type: "text" },
  { name: "email", label: "Email", placeholder: "e.g. example@gmail.com", type: "email" },
  { name: "phone", label: "Phone", placeholder: "e.g. 0771234567", type: "tel" },
  { name: "address", label: "Address", placeholder: "Enter your address", type: "text" },
  { name: "city", label: "City", placeholder: "e.g. Colombo", type: "text" },
  { name: "country", label: "Country", placeholder: "e.g. Sri Lanka", type: "text" },
];

export default function VerificationDetailsPage() {
  const router = useRouter();
  const { id: userId, username, firstName, lastName } = useUser();
  const kycInitiate = useKycInitiate();
  const updateProfile = useUpdateProfile();

  const [values, setValues] = useState<CreateUserFormData>(() => ({
    first_name: firstName ?? "",
    last_name: lastName ?? "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Sri Lanka",
  }));
  // Pre-fill what the member already saved (e.g. retrying a declined or
  // expired verification) once /user/me arrives, without overwriting anything
  // typed meanwhile. Adjusted during render, not in an effect.
  const { data: me } = useUserMe();
  const [prefilledFrom, setPrefilledFrom] = useState<typeof me>(undefined);
  if (me && prefilledFrom !== me) {
    setPrefilledFrom(me);
    setValues((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(prev) as (keyof CreateUserFormData)[]) {
        const saved = me[key];
        const untouched = !prev[key] || (key === "country" && prev[key] === "Sri Lanka");
        if (saved && untouched) next[key] = saved;
      }
      return next;
    });
  }

  // Errors show for a field once it's been edited (or on submit), like before.
  const [errors, setErrors] = useState<FieldErrors>({});
  const isValid = useMemo(() => createUserSchema.safeParse(values).success, [values]);

  const onFieldChange = (name: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: fieldError(name, value) }));
  };

  const error =
    updateProfile.error instanceof Error
      ? updateProfile.error.message
      : kycInitiate.error instanceof Error
        ? kycInitiate.error.message
        : null;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = createUserSchema.safeParse(values);
    if (!parsed.success) {
      const all: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const name = issue.path[0] as FieldName;
        all[name] ??= issue.message;
      }
      setErrors(all);
      haptic.notify("error");
      return;
    }
    const formData = parsed.data;
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

  const submitting = updateProfile.isPending || kycInitiate.isPending;

  return (
    <div className="bg-background flex min-h-dvh w-full flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-3">
        <PushHeader title="Your details" onBack={() => router.push("/verification")} />
        <div className="flex flex-col gap-1">
          <SectionLabel as="h2">Before we start</SectionLabel>
          <p className="text-ink3 text-[13px] leading-4">
            We need a few details before starting verification. Use the name on your ID.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col gap-3">
          <div className="stagger flex flex-col gap-5 [--field-bg:var(--background)]">
            {FIELDS.map((field) => (
              <TextField
                key={field.name}
                type={field.type}
                label={
                  <span className="inline-flex items-center gap-1">
                    {field.label}
                    <span aria-hidden className="bg-loss size-1 rounded-full" />
                  </span>
                }
                placeholder={field.placeholder}
                name={field.name}
                value={values[field.name]}
                onChange={(e) => onFieldChange(field.name, e.target.value)}
                error={errors[field.name]}
                required
              />
            ))}
          </div>

          {error && (
            <div role="alert" className="bg-loss-bg rounded-xl px-4 py-3">
              <p className="text-loss text-[13px] leading-4 font-bold">Verification error</p>
              <p className="text-ink2 mt-1 text-[13px] leading-4.5">{error}</p>
            </div>
          )}

          <div className="bg-background sticky bottom-0 mt-auto flex flex-col gap-2 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <Button type="submit" loading={submitting} disabled={submitting || !isValid}>
              Start verification
            </Button>
            <p className="text-ink3 flex items-center justify-center gap-1.5 text-center text-[12px]">
              <Icon name="lock" className="text-success size-3.5" />
              Your data is encrypted and never shared
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
