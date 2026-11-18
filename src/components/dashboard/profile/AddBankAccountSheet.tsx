"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cell, CellChevron } from "@/components/ui/cell";
import { SearchField } from "@/components/ui/search-field";
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
    >
      {picking ? (
        <div className="flex flex-col gap-3 pb-4">
          <div className="flex items-center gap-2 px-4">
            <button
              type="button"
              aria-label="Back"
              onClick={() => setPicking(false)}
              className="text-hint flex size-9 shrink-0 items-center justify-center rounded-full"
            >
              <ChevronLeft size={22} />
            </button>
            <SearchField
              className="bg-card flex-1"
              placeholder="Search banks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          {banksLoading ? (
            <p className="text-hint px-6 py-6 text-center text-sm">Loading banks…</p>
          ) : banksError ? (
            <p className="px-6 py-6 text-center text-sm text-[#f13131]">
              Couldn&apos;t load banks. Try again shortly.
            </p>
          ) : filteredBanks.length === 0 ? (
            <p className="text-hint px-6 py-6 text-center text-sm">No banks match “{search}”</p>
          ) : (
            <ul className="divide-border flex flex-col divide-y">
              {filteredBanks.map((b) => (
                <li key={b.code}>
                  <Cell
                    as="button"
                    className="[--cell-py:12px]"
                    onClick={() => {
                      haptic.select();
                      setBank(b);
                      setErrors((e) => ({ ...e, bankCode: undefined }));
                      setPicking(false);
                    }}
                    after={
                      bank?.code === b.code ? (
                        <span className="text-primary text-sm font-semibold">Selected</span>
                      ) : undefined
                    }
                  >
                    {b.name}
                  </Cell>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-5 px-5 pt-1 pb-5 [--field-bg:var(--background)]"
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setPicking(true)}
              className={
                "flex w-full items-center justify-between rounded-[14px] px-4 py-3 text-left text-[16px] shadow-[0_0_0_2px_#e2e8f0] dark:shadow-[0_0_0_2px_var(--outline)] " +
                (errors.bankCode ? "shadow-[0_0_0_2px_var(--destructive)]!" : "")
              }
            >
              <span className={bank ? "text-foreground" : "text-[#a2acb0]"}>
                {bank?.name ?? "Choose your bank"}
              </span>
              <CellChevron />
            </button>
            {errors.bankCode && (
              <p className="pl-4 text-[12px] text-[#f13131]">{errors.bankCode}</p>
            )}
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
            <p className="text-[13px] leading-4 text-[#64748b] dark:text-[#94a3b8]">
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
              <div className="bg-card flex items-center gap-3 rounded-[14px] px-4 py-3">
                <FileText size={20} className="text-hint shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15px]">{statement.name}</span>
                  <span className="text-hint text-[12px]">{fileSize(statement.size)}</span>
                </div>
                <button
                  type="button"
                  className="text-primary text-sm font-semibold"
                  onClick={() => fileInput.current?.click()}
                >
                  Change
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full rounded-[14px]"
                onClick={() => fileInput.current?.click()}
              >
                <Upload size={18} />
                Upload statement
              </Button>
            )}
            {errors.statement && (
              <p className="pl-4 text-[12px] text-[#f13131]">{errors.statement}</p>
            )}
          </div>

          {addAccount.error instanceof Error && (
            <div className="rounded-2xl bg-[#f13131]/10 px-4 py-3">
              <p className="text-[13px] leading-4.5 text-[#f13131]">{addAccount.error.message}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-[12px]"
            loading={addAccount.isPending}
          >
            {submitLabel}
          </Button>
          {addAccount.isPending && (
            <p className="text-hint -mt-3 text-center text-[13px]">{submitLabel}</p>
          )}
        </form>
      )}
    </Sheet>
  );
}
