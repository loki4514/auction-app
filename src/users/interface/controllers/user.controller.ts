import {
    Controller,
    Post,
    Body,
    UsePipes,
    HttpException,
    HttpStatus
} from "@nestjs/common";
import { ZodValidationPipe } from "src/shared/pipes/zod-validation.pipe"
import { CreateUserDTO, CreateUserSchema } from "../dtos/user.dto";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { CreateUserUseCase } from "src/users/application/use-cases/create-user.use-case";

// ✅ Pick only the email field for validation
const EmailSchema = CreateUserSchema.pick({ email: true });

@Controller('users')
export class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase
    ) { }

    @Post('create-account')
    @UsePipes(new ZodValidationPipe(CreateUserSchema))
    async createUser(@Body() body: CreateUserDTO) {
        try {
            const createdRes = await this.createUserUseCase.execute(body);
            if (!createdRes.success) {
                throw new HttpException({
                    success: false,
                    message: createdRes.message,
                    status: createdRes.status,
                }, createdRes.status);
            }

            return {
                success: true,
                message: "Account created successfully! Please check your email for verification.",
                statusCode: createdRes.status, // Created
            };
        } catch (error) {
            console.log(error)
            throw new HttpException({
                success: false,
                message: "Unable to create account. Please try again later.",
                status: HttpStatus.BAD_REQUEST,
                error: error.message,
            }, HttpStatus.BAD_REQUEST);
        }
    }
}
