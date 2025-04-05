import { Injectable } from "@nestjs/common";
import { VerifyUserRepository } from "src/users/domain/repository/verify-user.repository";
import { verifyUserEntity, verifyUserReponse } from "src/users/domain/types/verify-user.types";
import { VerifyUserMapper } from "../mappers/verify-user.mapper";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";

@Injectable()
export class VerifyUserPrismaRepository extends VerifyUserRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly verifyUserMapper: VerifyUserMapper
    ) {
        super();
    }

    async findUserByToken(email: string, token: string): Promise<verifyUserReponse<verifyUserEntity>> {
        const tokenRecord = await this.prisma.accounts.findFirst({
            where: {
                email: email,
                verification_token: token
            }
        });

        if (!tokenRecord) return { success: false, message: "Invalid token" };

        let user_data = this.verifyUserMapper.toEntity(tokenRecord);

        return { success: true, message: 'User found, with provided email', data: user_data };
    }

    async toggleVerificationStatus(email: string): Promise<verifyUserReponse<verifyUserEntity>> {
        const user = await this.prisma.accounts.findUnique({
            where: { email: email }
        });

        if (!user) return { success: false, message: "User not found" };

        const updatedUser = await this.prisma.accounts.update({
            where: { email: email },
            data: {
                is_verified: true,
                account_status: 'active'
            }
        });

        if (!updatedUser) return { success: false, message: "Failed to verify user" };

        return { success: true, message: "User verified successfully", data: null };
    }
}