import { Injectable, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ApplicationLogger } from 'src/shared/infrastructure/logger/application.logger';
import { IUserRepository } from 'src/users/domain/repository/user.repository';
import { UpdateUserDTO } from 'src/users/domain/entity/user.entiy';
import { UserUpdateDto } from 'src/users/interface/dtos/user.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly logger: ApplicationLogger,
    ) { }

    async updateUser(
        user_id: string,
        user: UserUpdateDto,
    ): Promise<{ status?: number; update_status: boolean }> {
        try {
            this.logger.debug(`Attempting to update user with ID: ${user_id}`);

            const updatedCount = await this.userRepository.updateUser(user_id, user);

            if (!updatedCount) {
                this.logger.log(`No user found with ID: ${user_id}`, UserService.name);
                return {
                    status: HttpStatus.NOT_FOUND,
                    update_status: false,
                };
            }

            this.logger.log(`User with ID ${user_id} updated successfully`, UserService.name);
            return {
                status: HttpStatus.OK,
                update_status: true,
            };
        } catch (error) {
            this.logger.error(error, `Failed to update user with ID: ${user_id}`, UserService.name);
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                update_status: false,
            };
        }
    }
}
