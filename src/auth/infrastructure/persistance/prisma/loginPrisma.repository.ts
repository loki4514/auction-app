import { Injectable } from "@nestjs/common";
import { LoginRepository } from "src/auth/domain/repository/login.repository";
import { getUsersReponse } from "src/auth/domain/types/getUser.type";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { GetUserMappers } from "../mappers/get-users.mappers";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { UserEntity } from "src/auth/domain/types/user-entity.type";

@Injectable()
export class LoginUser extends LoginRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly loginMapper: GetUserMappers,
        private readonly logger: ApplicationLogger
    ) {
        super();
    }

    /**
     * Fetch user by email and return mapped entity.
     * @param email - User's email
     * @returns `getUsersReponse<UserEntity | null>`
     */
    async getUser(email: string): Promise<getUsersReponse<UserEntity | null>> {
        try {
            const user = await this.findUserByEmail(email);
            if (!user) return this.userNotFoundResponse();

            if (this.isAccountRestricted(user.account_status)) {
                return this.restrictedAccountResponse(user.account_status);
            }

            const mappedUser = this.loginMapper.toGetUserEntity(user);
            return { success: true, status: 200, data: mappedUser, message: "User found" };
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    /**
     * Find user by email in the database.
     * @param email - User's email
     * @returns User data or null
     */
    private async findUserByEmail(email: string) {
        return this.prisma.accounts.findFirst({ where: { email } });
    }

    /**
     * Check if an account is restricted (banned or suspended).
     * @param status - Account status
     * @returns `boolean`
     */
    private isAccountRestricted(status: string): boolean {
        return ["banned", "suspended"].includes(status);
    }

    /**
     * Return a response for users with banned or suspended accounts.
     * @param status - Account status
     * @returns `getUsersReponse<null>`
     */
    private restrictedAccountResponse(status: string): getUsersReponse<null> {
        const messages = {
            banned: "Your account is banned. You are not authorized to access your account.",
            suspended: "Your account is suspended. Please contact support or your administrator."
        };
        return { success: false, status: 423, data: null, message: messages[status] };
    }

    /**
     * Return a response for when a user is not found.
     * @returns `getUsersReponse<null>`
     */
    private userNotFoundResponse(): getUsersReponse<null> {
        return {
            success: false,
            status: 404,
            message: "User authentication failed. Provided email is not registered.",
            data: null
        };
    }

    /**
     * Handle database errors and log them.
     * @param error - Error object
     * @returns `getUsersReponse<null>`
     */
    private handleDatabaseError(error: any): getUsersReponse<null> {
        this.logger.error(`Error fetching user: ${error.message}`, error.stack);
        return { success: false, status: 500, data: null, message: "There was a problem processing your request." };
    }
}
