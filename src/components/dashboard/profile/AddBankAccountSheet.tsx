"use client";

import { useId, useMemo, useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Bone } from "@/components/ui/bone";
import { Button } from "@/components/ui/button";
import { CellChevron } from "@/components/ui/cell";
import { Emoji } from "@/components/ui/emoji";
import { SearchField } from "@/components/ui/search-field";
import { List, ListRow, SectionLabel } from "@/components/ui/section";
import { Sheet } from "@/components/ui/sheet";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import { useAddBankAccount, useBanks, type Bank } from "@/hooks/query/useBankAccounts";
import {
  bankAccountSchema,
  STATEMENT_MAX_BYTES,
  STATEMENT_TYPES,
  type BankAccountFormInput,
} from "@/lib/validations";
import { haptic } from "@/platform";

type FieldName = keyof BankAccountFormInput;
type FieldErrors = Partial<Record<FieldName, string>>;

/** Re-check a field as it's edited, once it has shown an error. */
function fieldError(name: "accountNumber" | "accountName", value: string) {
  const result = bankAccountSchema.shape[name].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

export function AddBankAccountSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const toast = useToast();
  const { data: banks, isLoading: banksLoading, error: banksError } = useBanks(open);
  const addAccount = useAddBankAccount();

  const [picking, setPicking] = useState(false);
  const [search, setSearch] = useState("");
  const [bank, setBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [statement, setStatement] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const formId = useId();

  const filteredBanks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (banks ?? []).filter((b) => !q || b.name.toLowerCase().includes(q));
  }, [banks, search]);

  const reset = () => {
    setPicking(false);
    setSearch("");
    setBank(null);
    setAccountNumber("");
    setAccountName("");
    setStatement(null);
    setErrors({});
    addAccount.reset();
  };

  const close = (next: boolean) => {
    if (!next && addAccount.isPending) return; // don't drop an upload half-way
    onOpenChange(next);
    if (!next) reset();
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = bankAccountSchema.safeParse({
      bankCode: bank?.code,
      accountNumber,
      accountName,
      statement,
    });
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
    setErrors({});
    haptic.impact("medium");
    addAccount.mutate(parsed.data, {
      onSuccess: () => {
        haptic.notify("success");
        toast({
          type: "success",
          title: "Bank account submitted",
          description: "We'll verify it within a few hours.",
        });
        close(false);
      },
      onError: () => haptic.notify("error"),
    });
  };

  const submitLabel =
    addAccount.step === "uploading"
      ? "Uploading statement…"
      : addAccount.step === "submitting"
        ? "Submitting…"
        : "Submit for review";

  return (
    <Sheet
      open={open}
      onOpenChange={close}
      title={picking ? "Choose your bank" : "Add bank account"}
      onBack={picking ? () => setPicking(false) : undefined}
      hideClose={addAccount.isPending}
      flow
      footer={
        picking ? undefined : (
          <div className="flex flex-col gap-2">
            <Button type="submit" form={formId} loading={addAccount.isPending}>
              Submit for review
            </Button>
            {addAccount.isPending && (
              <p aria-live="polite" className="text-ink3 text-center text-[13px]">
                {submitLabel}
              </p>
            )}
          </div>
        )
      }
    >
      {picking ? (
        <div className="flex flex-col gap-3 pb-4">
          <div className="px-4">
            <SearchField
              placeholder="Search banks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {banksLoading ? (
            <div className="flex flex-col gap-3 px-4 py-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Bone key={i} className="h-11 w-full rounded-xl" />
              ))}
            </div>
          ) : banksError ? (
            <p className="text-loss px-6 py-6 text-center text-sm">
              Couldn&apos;t load banks. Try again shortly.
            </p>
          ) : filteredBanks.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-6 py-7 text-center">
              <Emoji src="/emoji/notepad.webp" size={60} className="animate-float" />
              <p className="text-ink2 text-[14px] font-semibold">No banks match “{search}”</p>
            </div>
          ) : (
            <List className="mx-4">
              {filteredBanks.map((b) => (
                <ListRow
                  key={b.code}
                  className="min-h-12"
                  onClick={() => {
                    haptic.select();
                    setBank(b);
                    setErrors((e) => ({ ...e, bankCode: undefined }));
                    setPicking(false);
                  }}
                  title={b.name}
                  after={
                    bank?.code === b.code ? <Badge variant="active">Selected</Badge> : undefined
                  }
                />
              ))}
            </List>
          )}
        </div>
      ) : (
        <form
          id={formId}
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-5 px-4 pt-1 pb-3 [--field-bg:var(--card)]"
        >
          <div className="flex flex-col gap-1">
            <SectionLabel>Bank</SectionLabel>
            <button
              type="button"
              onClick={() => setPicking(true)}
              className={cn(
                "press bg-chip mt-2 flex min-h-12 w-full items-center justify-between rounded-xl border-0 px-4 py-3 text-left text-[16px]",
                errors.bankCode && "shadow-[0_0_0_2px_var(--destructive)]"
              )}
            >
              <span className={bank ? "text-foreground font-semibold" : "text-ink3"}>
                {bank?.name ?? "Choose your bank"}
              </span>
              <CellChevron />
            </button>
            {errors.bankCode && <p className="text-loss pl-4 text-[12px]">{errors.bankCode}</p>}
          </div>

          <TextField
            label="Account number"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 0012 3456 7890"
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value);
              if (errors.accountNumber) {
                setErrors((prev) => ({
                  ...prev,
                  accountNumber: fieldError("accountNumber", e.target.value),
                }));
              }
            }}
            error={errors.accountNumber}
          />

          <TextField
            label="Account holder name"
            autoComplete="name"
            placeholder="Exactly as the bank has it"
            value={accountName}
            onChange={(e) => {
              setAccountName(e.target.value);
              if (errors.accountName) {
                setErrors((prev) => ({
                  ...prev,
                  accountName: fieldError("accountName", e.target.value),
                }));
              }
            }}
            error={errors.accountName}
          />

          <div className="flex flex-col gap-2">
            <SectionLabel>Bank statement</SectionLabel>
            <p className="text-ink3 text-[13px] leading-4">
              A recent bank statement or passbook page showing your name and this account number.
              PDF, JPEG or PNG, up to {STATEMENT_MAX_BYTES / 1024 / 1024} MB.
            </p>
            <input
              ref={fileInput}
              type="file"
              accept={STATEMENT_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                e.target.value = ""; // allow picking the same file again
                if (!file) return;
                setStatement(file);
                const check = bankAccountSchema.shape.statement.safeParse(file);
                setErrors((prev) => ({
                  ...prev,
                  statement: check.success ? undefined : check.error.issues[0]?.message,
                }));
              }}
            />
            {statement ? (
              <List>
                <ListRow
                  icon={<FileText size={18} className="text-ink2" />}
                  title={<span className="block truncate">{statement.name}</span>}
                  subtitle={fileSize(statement.size)}
                  after={
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-card"
                      onClick={() => fileInput.current?.click()}
                    >
                      Change
                    </Button>
                  }
                />
              </List>
            ) : (
              <Button
                variant="secondary"
                size="default"
                className={cn(
                  "w-full",
                  errors.statement && "shadow-[0_0_0_2px_var(--destructive)]"
                )}
                onClick={() => fileInput.current?.click()}
              >
                <Upload size={18} />
                Upload statement
              </Button>
            )}
            {errors.statement && <p className="text-loss pl-4 text-[12px]">{errors.statement}</p>}
          </div>

          {addAccount.error instanceof Error && (
            <div role="alert" className="bg-loss-bg rounded-xl px-4 py-3">
              <p className="text-loss text-[13px] leading-4.5">{addAccount.error.message}</p>
            </div>
          )}
        </form>
      )}
    </Sheet>
  );
}
