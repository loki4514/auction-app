import { z } from 'zod'
export const PasswordReseSchema = z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    token: z.string().min(1, { message: "Token is required" })
});

export type PasswordResetDTO = z.infer<typeof PasswordReseSchema>