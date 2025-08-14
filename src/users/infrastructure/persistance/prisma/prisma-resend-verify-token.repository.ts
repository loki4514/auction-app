import { Injectable } from "@nestjs/common";
import { ResendVerifyToken } from "src/users/domain/repository/resend-verify-token.repository";
import { resendVerifyTokenResponse } from "src/users/domain/types/verify-user.types";
import { VerifyUserMapper } from "../mappers/verify-user.mapper";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";

@Injectable()
export class ResendVerifyTokenPrismaRepository extends ResendVerifyToken {
    constructor(
        private readonly prisma: PrismaService,
        private readonly verifyUserMapper: VerifyUserMapper,
        private readonly logger: ApplicationLogger
    ) {
        super();
    }

    /**
     * Finds a user by email in the database.
     * @param email - The email of the user to search for.
     * @returns A response indicating whether the user was found and their verification status.
     */
    async findUserByEmail(email: string): Promise<resendVerifyTokenResponse> {
        this.logger.log(`Finding user by email: ${email}`);
        this.logger.debug(`Querying users table for email: ${email}`);

        const verified_account = await this.prisma.users.findFirst({
            where: { email }
        });

        if (!verified_account) {
            this.logger.log(`No user found with email: ${email}`);
            return { success: false, message: 'User not found', status: 404, data: null };
        }

        this.logger.debug(`User record found: ${JSON.stringify(verified_account)}`);

        const user_data = this.verifyUserMapper.accountStatus(verified_account);
        this.logger.debug(`Mapped user account status: ${JSON.stringify(user_data)}`);

        this.logger.log(`User with email ${email} found successfully`);
        return { success: true, message: 'User found', status: 200, data: user_data };
    }

    /**
     * Resends a verification token to the user.
     * @param email - The user's email.
     * @param token - The new verification token.
     * @param expiry - Token expiration time in seconds.
     * @returns A response indicating success or failure.
     */
    async resendVerifyToken(email: string, token: string, expiry: string): Promise<resendVerifyTokenResponse> {
        this.logger.log(`Attempting to resend verification token to email: ${email}`);
        this.logger.debug(`New token: ${token}, Expiry: ${expiry}`);

        const is_user = await this.findUserByEmail(email);
        if (!is_user.success) {
            this.logger.log(`Resend token aborted: ${is_user.message}`);
            return is_user;
        }

        this.logger.debug(`Updating verification token for email: ${email}`);

        const updatedToken = await this.prisma.users.update({
            where: { email },
            data: {
                verification_token: token,
                verification_expires_at: expiry
            }
        });

        if (!updatedToken) {
            this.logger.log(`Failed to save verification token for email: ${email}`);
            return { success: false, message: 'Failed to save the verification token', status: 400, data: null };
        }

        this.logger.debug(`Updated user record: ${JSON.stringify(updatedToken)}`);
        this.logger.log(`Verification token saved successfully for email: ${email}`);

        return { success: true, message: 'Verification token saved successfully', status: 200, data: null };
    }
}
