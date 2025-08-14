import { Injectable, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { CreateUserDTO, UpdateUserDTO, UserEntity } from "src/users/domain/entity/user.entiy";
import { IUserRepository } from "src/users/domain/repository/user.repository";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { UserMappers } from "../mappers/user-mappers";


const logger = new ApplicationLogger();

@Injectable()
export class UserPrismaRepository extends IUserRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findByEmail(email: string): Promise<{ data: UserEntity | null; debug?: string }> {
        try {
            const user = await this.prisma.users.findFirst({
                where: { email }
            });

            return { data: UserMappers.fromORM(user) };
        } catch (error) {
            logger.error("Failed to find user by email", { email, error });
            throw new InternalServerErrorException("Error while finding user by email");
        }
    }



    async findByUserPhoneNumber(phone_number: string): Promise<{ data: UserEntity | null }> {
        try {
            const user = await this.prisma.users.findFirst({
                where: { phone_number }
            });
            return { data: UserMappers.fromORM(user) };
        } catch (error) {
            logger.error("Failed to find user by phone", { phone_number, error });
            throw new InternalServerErrorException("Error while finding user by phone");
        }
    }



    async create(user: CreateUserDTO): Promise<{ data: UserEntity | null; debug?: string }> {
        try {
            const createdUser = await this.prisma.users.create({
                data: user
            });

            return {
                data: UserMappers.fromORM(createdUser),
            };
        } catch (error) {
            logger.error("User creation failed", { user, error });
            throw new BadRequestException("User could not be created");
        }
    }

    async updateUser(user_id: string, user: UpdateUserDTO): Promise<{ status?: number; update_status: boolean }> {
        try {
            // Check if user exists
            const existingUser = await this.prisma.users.findUnique({
                where: { user_id }
            });

            if (!existingUser) {
                return { status: 404, update_status: false };
            }

            // Update user
            await this.prisma.users.update({
                where: { user_id },
                data: {
                    ...UserMappers.toPartialORM(user),
                    updated_at: new Date(),
                },
            });

            return { status: 200, update_status: true };
        } catch (error) {
            logger.error("User update failed", { user_id, user, error });
            throw new InternalServerErrorException("Error while updating user");
        }
    }
}
