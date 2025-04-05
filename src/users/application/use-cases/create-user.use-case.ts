import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { TokenService } from "src/shared/utils/token.service";
import { UserRepository } from "src/users/domain/repository/user.repository";
import { MailService } from "src/users/infrastructure/persistance/mail/mail.service";
import { CreateUserDTO } from "src/users/interface/dtos/user.dto";
import { UserEntity } from "src/users/domain/entity/user.entiy";
import { CreateUserResponse } from "src/users/domain/types/use-case.reponse";



@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: ApplicationLogger,
        private readonly generateToken: TokenService,
        private readonly sendMailService: MailService
    ) {}

    async execute(dto: CreateUserDTO): Promise<CreateUserResponse<string | object >> {
        try {
            // Check if user already exists
            const existingUser = await this.userRepository.findByEmail(dto.email);
            
            if (!existingUser.success || existingUser.data) {
                this.logger.warn(`User registration failed - duplicate email: ${dto.email}`);
                return {
                    success: false,
                    message: "Email is already in use",
                    status: 409, // Conflict
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            
            // Generate verification token
            const verificationToken = this.generateToken.generateTimedToken(dto.email);

            const newUser: UserEntity = {
                account_id: crypto.randomUUID(),
                email: dto.email,
                password_hash: hashedPassword,
                created_at: new Date(),
                is_verified: false,
                user_role: dto.user_role || "bidder",
                is_google_login: false,
                account_status: "pending",
                verification_token: verificationToken,
                verification_expires_at: new Date(Date.now() + 3600 * 1000),
                last_login: null,
                first_name: dto.first_name,
                last_name: dto.last_name,
                profile_image_url: null, // Can be updated later
            };

            // Save user
            const createdUser = await this.userRepository.create(newUser);

            if (!createdUser.success) {
                this.logger.error(`Failed to create user: ${createdUser.debug}`);
                return {
                    success: false,
                    message: "Failed to create user",
                    status: createdUser.status || 500,
                };
            }

            // Send verification email
            try {
                const mailResponse = await this.sendMailService.sendVerificationEmail(
                    dto.email, 
                    verificationToken, 
                    `${dto.first_name} ${dto.last_name}`
                );

                if (!mailResponse.status) {
                    this.logger.warn(`User created, but verification email failed: ${dto.email} - ${mailResponse.error}`);
                }
            } catch (mailError) {
                this.logger.error(`User created, but failed to send verification email: ${dto.email}`, mailError);
            }

            return {
                success: true,
                message: "User created successfully. Verification email sent.",
                status: 201,
            };
        } catch (error) {
            this.logger.error("Unexpected error in CreateUserUseCase", error instanceof Error ? error.stack : String(error));
            console.log("thisis is error", error)
            return {
                success: false,
                message: "Unexpected error occurred",
                status: 500,
                debug : error instanceof Error ? error.message : String(error),
            };
        }
    }
}


