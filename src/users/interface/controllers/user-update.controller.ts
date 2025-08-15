import {
    Controller,
    Patch,
    Body,
    UsePipes,
    HttpException,
    HttpStatus,
    Param
} from "@nestjs/common";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { ZodValidationPipe } from "src/shared/pipes/zod-validation.pipe";
import { UserUpdateService } from "src/users/application/use-cases/update-user.use-case";
import { UpdateUserSchema } from "../dtos/user.dto";
import { UpdateUserDTO } from "src/users/domain/entity/user.entiy";

@Controller("user")
export class UpdateUserController {
    constructor(
        private readonly logger: ApplicationLogger,
        private readonly updateUserService: UserUpdateService
    ) {}

    @Patch("update-user/:user_id")
    @UsePipes(new ZodValidationPipe(UpdateUserSchema))
    async updateUserHandler(
        @Param("user_id") user_id: string,
        @Body() body: UpdateUserDTO
    ) {
        try {
            const update_response = await this.updateUserService.updateUser(
                user_id,
                body
            );

            return {
                success: true,
                message: "User updated successfully",
                data: update_response
            };
        } catch (error) {
            this.logger.error(
                `Failed to update user ${user_id}`,
                error.stack,
                "UpdateUserController"
            );
            throw new HttpException(
                {
                    success: false,
                    message: "Unable to update user. Please try again later.",
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
