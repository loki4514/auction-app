import { z } from "zod";

export const VerifyAccountSchema = z.object({
    email: z.string({ required_error: 'email is required' }).email({ message: "Invalid email format" }),
    token: z.string({ required_error: 'token is required' }).min(1, { message: "Token is required" })
});

export type VerifyAccountDTO = z.infer<typeof VerifyAccountSchema>;

export const verifyToken = z.object({
    token : z.string({ required_error: 'token is required' })
})

export type verifyTokenDTO = z.infer<typeof verifyToken>

