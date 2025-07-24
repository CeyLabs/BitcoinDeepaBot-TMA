import { z } from 'zod';

// User registration validation schema matching backend CreateUserDto
export const createUserSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters'),
  
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be at most 50 characters'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address'),
  
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+94\d{9}$/, { message: 'Please provide a valid phone number (e.g., +94771234567)' }),
  
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be at most 200 characters')
    .optional()
    .or(z.literal('')),
  
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be at most 50 characters')
    .optional()
    .or(z.literal('')),
  
  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must be at most 50 characters')
    .optional()
    .or(z.literal(''))
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Individual field validation functions for real-time validation
export const validateField = (field: keyof CreateUserFormData, value: string) => {
  try {
    const fieldSchema = createUserSchema.shape[field];
    fieldSchema.parse(value);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.issues[0]?.message || 'Invalid value' };
    }
    return { isValid: false, error: 'Invalid value' };
  }
};