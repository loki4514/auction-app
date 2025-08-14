import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { TokenService } from "src/shared/utils/token.service";
import { MailService } from "src/users/infrastructure/persistance/mail/mail.service";
import { CreateUserDTO } from "src/users/interface/dtos/user.dto";
import { UserDTO, UserEntity } from "src/users/domain/entity/user.entiy";
import { CreateUserResponse } from "src/users/domain/types/use-case.reponse";
import { IUserRepository } from "src/users/domain/repository/user.repository";
import { AuthService } from "src/shared/utils/google_auth_service";
import { ICompanyRepository } from "src/users/domain/repository/company.repository";
import { EmailQueueService } from "src/shared/queue/services/email-queue.service";
import { getISTDate } from "src/shared/utils/helper_function";



@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly logger: ApplicationLogger,
        private readonly generateToken: TokenService,
        private readonly emailQueueService: EmailQueueService,
        private readonly companyService: ICompanyRepository,
        private readonly authService : AuthService,
    ) { }

    async execute(dto: CreateUserDTO): Promise<CreateUserResponse<string | object>> {
        try {
            const existingUser = await this.userRepository.findByEmail(dto.email);
            if (existingUser.data) {
                this.logger.warn(`User registration failed - duplicate email: ${dto.email}`);
                return {
                    success: false,
                    message: "Email is already in use",
                    status: 409,
                };
            }

            // Create associated company first
            const created_company = await this.companyService.addedCompnay();
            if (!created_company.account_id) {
                this.logger.error("Failed to create associated company.");
                return {
                    success: false,
                    message: "Failed to create company",
                    status: 500,
                };
            }

            let hashedPassword = "";
            let verificationToken: string | null = null;
            let verificationExpiresAt: Date | null = null;

            // --- Handle Google SignUp ---
            if (dto.is_google && dto.google_code) {
                const googleUser = await this.authService.verifyGoogleToken(dto.google_code, dto.email);
                if (!googleUser.success) {
                    return {
                        success: false,
                        message: "Google token verification failed",
                        status: 401,
                    };
                }

                // No need to hash password or send email
                hashedPassword = "";
                verificationToken = null;
                verificationExpiresAt = null;

            } else {
                // --- Handle normal email signup ---
                hashedPassword = await bcrypt.hash(dto.password, 10);
                verificationToken = this.generateToken.generateTimedToken(dto.email);
                verificationExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiry
            }

            const newUser: UserDTO = {
                account_id: created_company.account_id,
                email: dto.email,
                password_hash: hashedPassword,
                user_role: 'bidder',
                user_status: dto.is_google ? 'verified' : 'pending',
                verification_token: verificationToken,
                verification_expires_at: verificationExpiresAt,
                first_name: dto.first_name,
                last_name: dto.last_name,
                created_at : getISTDate(),
                updated_at : getISTDate()
            };

            const createdUser = await this.userRepository.create(newUser);
            if (!createdUser.data) {
                this.logger.error(`Failed to create user: ${createdUser.debug}`);
                return {
                    success: false,
                    message: "Failed to create user",
                    status: 500,
                };
            }

            // Send email only for non-Google signups
            if (!dto.is_google && verificationToken) {
                if (!dto.is_google && verificationToken) {
                try {
                    await this.emailQueueService.addVerificationEmailJob({
                        email: dto.email,
                        verificationToken,
                        fullName: `${dto.first_name} ${dto.last_name}`
                    });
                    
                    this.logger.log(`Verification email queued for: ${dto.email}`);
                } catch (queueError) {
                    this.logger.error(`Failed to queue verification email for ${dto.email}`, queueError);
                    // Don't fail user creation if email queuing fails
                }
            }
            }

            return {
                success: true,
                message: dto.is_google
                    ? "User created successfully via Google"
                    : "User created successfully. Verification email sent.",
                status: 201,
            };
        } catch (error) {
            this.logger.error("Unexpected error in CreateUserUseCase", error instanceof Error ? error.stack : String(error));
            return {
                success: false,
                message: "Unexpected error occurred",
                status: 500,
                debug: error instanceof Error ? error.message : String(error),
            };
        }
    }

}


