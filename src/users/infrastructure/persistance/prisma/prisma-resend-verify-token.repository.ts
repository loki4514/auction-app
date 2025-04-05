import { Injectable } from "@nestjs/common";
import { ResendVerifyToken } from "src/users/domain/repository/resend-verify-token.repository";
import { resendVerifyTokenResponse } from "src/users/domain/types/verify-user.types";
import { VerifyUserMapper } from "../mappers/verify-user.mapper";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";


@Injectable()
export class ResendVerifyTokenPrismaRepository extends ResendVerifyToken {
    constructor(private readonly prisma: PrismaService,
        private readonly verifyUserMapper : VerifyUserMapper
    ) {
        super();
    }

    /**
     * Finds a user by email in the database.
     * @param email - The email of the user to search for.
     * @returns A response indicating whether the user was found and their verification status.
     */
    async findUserByEmail(email: string): Promise<resendVerifyTokenResponse> {
        const verified_account = await this.prisma.accounts.findFirst({
            where: { email: email }
        });

        // If user is not found, return error response
        if (!verified_account) {
            return { success: false, message: 'User not found', status: 404, data : null};
        }

        // If user is already verified, return success response

        // If user exists but is not verified, return success false
        let user_data = this.verifyUserMapper.accountStatus(verified_account)
        return { success: true, message: 'User found', status: 200, data:  user_data };
    }

    /**
     * Resends a verification token to the user.
     * @param email - The user's email.
     * @param token - The new verification token.
     * @param expiry - Token expiration time in seconds.
     * @returns A response indicating success or failure.
     */
    async resendVerifyToken(email: string, token: string, expiry: string): Promise<resendVerifyTokenResponse> {
        // Check if the user exists and is not already verified
        const is_user = await this.findUserByEmail(email);
        if (!is_user.success) return is_user;

        // Calculate expiration time in IST (Indian Standard Time)


        // Update the verification token and expiry in the database
        const updatedToken = await this.prisma.accounts.update({
            where: { email },
            data: {
                verification_token: token,
                verification_expires_at: expiry
            }
        });

        // If update fails, return an error response
        if (!updatedToken) {
            return { success: false, message: 'Failed to save the verification token', status: 400, data : null };
        }

        return { success: true, message: 'Verification token saved successfully', status: 200 , data : null};
    }
}