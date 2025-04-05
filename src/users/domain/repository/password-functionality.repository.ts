import { passwordResetResponse, verifyPasswordEntity } from "../types/password-reset.types";

export abstract class PasswordResetInterface {
    abstract findByEmail(email: string): Promise<boolean>;
    abstract savePasswordResetToken(email: string, token: string, expiresAt: string): Promise<boolean>;
}

export abstract class verifyAndUpdatePassword {
    abstract verifyPasswordToken(email: string, token: string): Promise<passwordResetResponse>
    abstract updatePassword(password: string, email: string): Promise<{ success: boolean; message: string, status: Number }>
}