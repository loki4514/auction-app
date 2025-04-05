import { z } from 'zod';

export const LoginAuthDto = z.object({
    email: z
        .string({
            required_error: 'Email is required',  // ✅ Fixes "required" issue
            invalid_type_error: 'Email must be a string', // Ensures correct type
        })
        .email({ message: 'Invalid email format' }),

    password: z
        .string({
            required_error: 'Password is required', // ✅ Fixes "required" issue
            invalid_type_error: 'Password must be a string',
        })
        .min(6, { message: 'Password must be at least 6 characters long' }),
});

// TypeScript type inference
export type AuthDtoType = z.infer<typeof LoginAuthDto>;