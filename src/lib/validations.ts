import { z } from "zod";

/**
 * A Sri Lankan mobile number as people type it ("077 123 4567", "0771234567",
 * "94771234567", "+94 77 123 4567") in the +94771234567 form the backend
 * expects. Anything else comes back as typed (and fails the check).
 */
export function normalizeLkPhone(input: string): string {
  const v = input.replace(/[\s\-()]/g, "");
  if (/^0\d{9}$/.test(v)) return `+94${v.slice(1)}`;
  if (/^94\d{9}$/.test(v)) return `+${v}`;
  if (/^7\d{8}$/.test(v)) return `+94${v}`;
  return v;
}

// User registration validation schema matching backend CreateUserDto
export const createUserSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters"),

  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters"),

  email: z.string().min(1, "Email is required").email("Please provide a valid email address"),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .transform(normalizeLkPhone)
    .pipe(
      z.string().regex(/^\+94\d{9}$/, {
        message: "Enter a Sri Lankan number, e.g. 0771234567",
      })
    ),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be at most 200 characters"),

  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be at most 50 characters"),

  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must be at most 50 characters"),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Payout bank account — mirrors the backend's AddBankAccountDto.
export const STATEMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const STATEMENT_MAX_BYTES = 8 * 1024 * 1024;

export const bankAccountSchema = z.object({
  bankCode: z.number({ message: "Choose your bank" }).int().positive("Choose your bank"),
  accountNumber: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\d{6,20}$/, "Account number must be 6–20 digits")),
  accountName: z
    .string()
    .trim()
    .min(1, "Account holder name is required")
    .max(255, "Account holder name is too long"),
  statement: z
    .instanceof(File, { message: "Upload a bank statement" })
    .refine((f) => (STATEMENT_TYPES as readonly string[]).includes(f.type), {
      message: "Statement must be a PDF, JPEG or PNG",
    })
    .refine((f) => f.size > 0 && f.size <= STATEMENT_MAX_BYTES, {
      message: "Statement must be 8 MB or smaller",
    }),
});

export type BankAccountFormInput = z.input<typeof bankAccountSchema>;
export type BankAccountFormData = z.output<typeof bankAccountSchema>;

/** Used until /sell/price (which returns the backend's minimum) has loaded. */
export const DEFAULT_SELL_MIN_SATS = 1000;

/** Sats to sell: a whole number between the minimum and the balance. */
export const sellAmountSchema = (
  balanceSats: number,
  minSats = DEFAULT_SELL_MIN_SATS,
  maxSats = Number.POSITIVE_INFINITY
) =>
  z
    .number({ message: "Enter an amount in sats" })
    .int("Use whole sats")
    .min(minSats, `Minimum is ${minSats.toLocaleString("en-US")} sats`)
    .max(maxSats, `Maximum per sale is ${maxSats.toLocaleString("en-US")} sats`)
    .max(balanceSats, "That's more than your balance");

/** One-time buy amount in whole LKR; limits come from GET /buy/price. */
export const buyAmountSchema = (minLkr = 100, maxLkr = Number.POSITIVE_INFINITY) =>
  z
    .number({ message: "Enter an amount in LKR" })
    .int("Use whole rupees")
    .min(minLkr, `Minimum is ${minLkr.toLocaleString("en-US")} LKR`)
    .max(maxLkr, `Maximum per buy is ${maxLkr.toLocaleString("en-US")} LKR`);

/** P2P send amount; limits come from GET /p2p/me (the bot's). */
export const sendAmountSchema = (balanceSats: number, maxSats: number, dailyRemaining: number) =>
  z
    .number({ message: "Enter an amount in sats" })
    .int("Use whole sats")
    .min(1, "Enter an amount in sats")
    .max(maxSats, `Maximum per send is ${maxSats.toLocaleString("en-US")} sats`)
    .max(dailyRemaining, `You can send ${dailyRemaining.toLocaleString("en-US")} more sats today`)
    .max(balanceSats, "That's more than your balance");

/** @username, username or a numeric Telegram ID */
export const sendRecipientSchema = z
  .string()
  .trim()
  .min(1, "Enter a @username or Telegram ID")
  .max(64, "That's too long for a username or ID");

export const sendMemoSchema = z.string().max(280, "Keep the note under 280 characters");
