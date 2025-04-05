import { Injectable } from "@nestjs/common";
import { PasswordResetInterface, verifyAndUpdatePassword } from "src/users/domain/repository/password-functionality.repository";
import { passwordResetResponse, verifyPasswordEntity } from "src/users/domain/types/password-reset.types";
import { VerifyPasswordMapper } from "../mappers/verify-password.mapper";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";


@Injectable()
export class PasswordResetPrismaRepository extends PasswordResetInterface {
    constructor(private readonly prisma: PrismaService
    ) {
        super()
    }

    async findByEmail(email: string) : Promise<boolean> {
        // Convert user object to boolean
        let user = await this.prisma.accounts.findFirst({
            where: { email: email }
        });

        return !!user

    }

    async savePasswordResetToken(email: string, token: string, expiresAt: string): Promise<boolean> {
        try {
            const result = await this.prisma.password_reset_tokens.create({
                data: { email, token, expires_at : expiresAt, is_used: false },
            });

            return !!result; // Return true if successful
        } catch (error) {
            console.error("Error saving password reset token:", error);
            return false;
        }
    }

}



@Injectable()
export class VerifyAndUpdatePasswordPrismaRepository extends verifyAndUpdatePassword {
    constructor(private readonly prisma: PrismaService,
        private readonly passwordMapper: VerifyPasswordMapper

    ) {
        super()
    }

    async verifyPasswordToken(email: string, token: string): Promise<passwordResetResponse> {
        try {
            const resetToken = await this.prisma.password_reset_tokens.findFirst({
                where: {
                    email,
                    token,
                },
            });

            if (!resetToken) {
                return { success: false, message: 'Invalid token or email', status: 401 , data : null };
            }
            let user_data = this.passwordMapper.toPasswordEntity(resetToken)


            return { success: true, message: 'Token is valid', status: 200, data : user_data };
        } catch (error) {
            return {
                success: false,
                message: 'An error occurred while verifying the token',
                status: 500,
                data : null
            };
        }
    }

    async updatePassword(hashedPassword: string, email: string): Promise<{ success: boolean; message: string, status : Number }> {
        try {
            const updateResult = await this.prisma.accounts.update({
                where: { email },
                data: { password_hash: hashedPassword },
            });

            if (!updateResult) return { success: false, message: "Password update failed", status : 400 };

            return { success: true, message: "Password updated successfully", status : 200 };
        } catch (error) {
            console.error("Error updating password:", error);
            return { success: false, message: "Internal server error", status : 500 };
        }
    }
}
