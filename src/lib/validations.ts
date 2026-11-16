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
