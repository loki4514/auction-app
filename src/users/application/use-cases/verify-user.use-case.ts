import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { VerifyUserRepository } from "src/users/domain/repository/verify-user.repository";
import { CreateUserResponse } from "src/users/domain/types/use-case.reponse";

@Injectable()
export class VerifyUserUseCase {
    constructor(
        private readonly verifyUserRepo: VerifyUserRepository,
        private readonly logger: ApplicationLogger
    ) {}

    async verifyAccount(email: string, token: string): Promise<CreateUserResponse<string | object>> {
        try {
            // Fetch user by email and token
            console.log(email, token,'token and email are reaive')
            const verifingUser = await this.verifyUserRepo.findUserByToken(email, token);

            if (!verifingUser.success || !verifingUser.data) {
                this.logger.warn(`Failed to get user: ${JSON.stringify(verifingUser)}`);
                return { success: false, status: 404, message: "User not found or expired token"};
            }

            const { email: userEmail, token: userToken, expiresAt } = verifingUser.data;

            // Validate token
            if (userToken !== token) {
                this.logger.warn(`Token mismatch for user ${userEmail}`);
                return { success: false, status: 400, message: "Invalid verification token" };
            }

            // Check if token is expired
            if (moment().isAfter(moment(expiresAt))) {
                this.logger.warn(`Token expired for user ${userEmail}`);
                return { success: false, status: 400, message: "Verification token expired" };
            }

            // Mark user as verified
            const updateResult = await this.verifyUserRepo.toggleVerificationStatus(email);
            if (!updateResult.success) {
                this.logger.error(`Failed to update verification status: ${updateResult.message}`);
                return { success: false, status: 500, message: "Failed to update verification status" };
            }

            this.logger.log(`User verified successfully: ${userEmail}`);
            return { success: true, status: 200, message: "User verified successfully" };
        } catch (error) {
            this.logger.error(`Failed to verify user`, error instanceof Error ? error.stack : String(error));
            return {
                success: false,
                message: "Failed to verify user",
                status: 500,
                debug: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
