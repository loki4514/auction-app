import { z } from 'zod';

export const CreateUserSchema = z.object({
    first_name: z
        .string({ required_error: 'First name is required' })
        .min(1, 'First name cannot be empty'),

    last_name: z
        .string({ required_error: 'Last name is required' })
        .min(1, 'Last name cannot be empty'),

    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters'),

    is_google: z.boolean().optional(), // Optional flag to indicate Google signup

    google_code: z
        .string()
        .min(1, 'Google code cannot be empty')
        .optional(), // Only required if `is_google` is true

    // Optional: Add conditional validation if needed
    // .refine(data => !data.is_google || data.google_code, {
    //   message: "Google code is required when using Google signup",
    //   path: ["google_code"],
    // })

    // Optional user role enum
    // user_role: z.enum(['bidder', 'auctioneer', 'admin']).optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;




export const UpdateUserSchema = z.object({
    first_name: z.string().trim().optional(),
    last_name: z.string().trim().nullable().optional(),
    phone_number: z
        .string()
        .regex(/^\+?[1-9]\d{6,14}$/, { message: 'Invalid phone number' })
        .optional(),
    date_of_birth: z.coerce.date().nullable().optional(),
});

export type UserUpdateDto = z.infer<typeof UpdateUserSchema>;
