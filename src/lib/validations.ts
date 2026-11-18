import { z } from "zod";

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
    .regex(/^\+94\d{9}$/, {
      message: "Please provide a valid phone number (e.g., +94771234567)",
    }),

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

export const SELL_MIN_SATS = 1000;

/** Sats to sell: a whole number between the minimum and the balance. */
export const sellAmountSchema = (balanceSats: number) =>
  z
    .number({ message: "Enter an amount in sats" })
    .int("Use whole sats")
    .min(SELL_MIN_SATS, `Minimum is ${SELL_MIN_SATS.toLocaleString("en-US")} sats`)
    .max(balanceSats, "That's more than your balance");
