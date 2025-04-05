import { resendVerifyTokenResponse } from "../types/verify-user.types";


export abstract class ResendVerifyToken {
    abstract findUserByEmail(email: string): Promise<resendVerifyTokenResponse>
    abstract resendVerifyToken(email: string, token: string, expiry: string): Promise<resendVerifyTokenResponse>
}