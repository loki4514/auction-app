import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { UserEntity } from "src/users/domain/entity/user.entiy";
import { UserRepository } from "src/users/domain/repository/user.repository";





@Injectable()
export class UserPrismaRepository extends UserRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findByEmail(email: string): Promise<{ success: boolean; message?: string; status?: number; data?: UserEntity; debug?: string }> {
        try {
            const user = await this.prisma.accounts.findFirst({
                where: {
                    OR: [{ email }],
                },
            });


            if (user) {
                return {
                    success: false,
                    message: 'User found',
                    status: 409,
                };
            }

            return {
                success: true,
                message : 'user not found'
            };
        } catch (error) {
            console.error('Error finding user by username or email:', error);
            return {
                success: false,
                message: 'Database error while searching for user',
                status: 500,
                debug: error instanceof Error ? error.message : String(error),
            };
        }
    }

    async create(user: UserEntity): Promise<{ success: boolean; message?: string; status?: number; data?: UserEntity; debug?: string }> {
        try {
            const createdUser = await this.prisma.accounts.create({ data: user });

            return {
                success: true,
                data: createdUser,
            };
        } catch (error) {
            console.error('Error creating user:', error);
            return {
                success: false,
                message: 'Database error while creating user',
                status: 500,
                debug: error instanceof Error ? error.message : String(error),
            };
        }
    }
}



