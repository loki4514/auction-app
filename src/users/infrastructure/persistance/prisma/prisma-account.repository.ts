
import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { AccountMappers } from "../mappers/account-mappers";
import { ICompanyRepository } from "src/users/domain/repository/company.repository";
import { AccountEntity, UpdateAccountDTO } from "src/users/domain/entity/account.entity";
import moment from "moment-timezone";

const logger = new ApplicationLogger();

@Injectable()
export class CompanyRepository extends ICompanyRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly accountMapper: AccountMappers
    ) {
        super();
    }

    async findByCompanyEmail(email: string): Promise<{ status?: number; data?: AccountEntity | null }> {
        try {
            const company = await this.prisma.accounts.findFirst({
                where: { email },
            });

            return {
                status: company ? 200 : 404,
                data: AccountMappers.fromORM(company),
            };
        } catch (error) {
            logger.error("Failed to find company by email", { email, error });
            throw new InternalServerErrorException("Error while finding company by email");
        }
    }

    async findByCompanyPhoneNumber(
        phone_number: string
    ): Promise<{ status?: number; data?: AccountEntity | null }> {
        try {
            const company = await this.prisma.accounts.findFirst({
                where: { phone_number },
            });

            return {
                status: company ? 200 : 404,
                data: AccountMappers.fromORM(company),
            };
        } catch (error) {
            logger.error("Failed to find company by phone", { phone_number, error });
            throw new InternalServerErrorException("Error while finding company by phone");
        }
    }

    async addedCompnay(): Promise<{ account_id: string | null }> {
        try {
            const istNow = moment().tz("Asia/Kolkata").toDate();

            const account = await this.prisma.accounts.create({
                data: {
                    created_at: istNow,
                    updated_at: istNow,
                    is_used_free_plan: false,// You may want to pass this from config or params
                    company_name: "Temporary",
                },
            });

            return { account_id: account.account_id };
        } catch (error) {
            logger.error("Failed to create company account", { error });
            throw new InternalServerErrorException("Error while creating company account");
        }
    }

    async updateCompany(company_details: UpdateAccountDTO): Promise<boolean> {
        try {
            const { account_id } = company_details;

            const existing = await this.prisma.accounts.findUnique({
                where: { account_id },
            });

            if (!existing) {
                throw new NotFoundException(`Account with id ${account_id} not found`);
            }

            await this.prisma.accounts.update({
                where: { account_id },
                data: {
                    ...AccountMappers.toPartialORM(company_details),
                    updated_at: moment().tz('Asia/Kolkata').toDate(),
                },
            });

            return true; // ✅ return boolean for success
        } catch (error) {
            logger.error(
                error,
                'Failed to update company account',
                CompanyRepository.name,
            );
            throw new InternalServerErrorException(
                'Error while updating company account',
            );
        }
    }

    async becomeAuctioneer(account_id: string, user_id: string): Promise<boolean> {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                // 1️⃣ Update account type
                await tx.accounts.update({
                    where: { account_id },
                    data: { account_type: "auctioneer" },
                });

                // 2️⃣ Update user role for the given user_id
                await tx.users.update({
                    where: { user_id },
                    data: { user_role: "admin" },
                });

                return true;
            });

            logger.log(`Account ${account_id} is now auctioneer and user ${user_id} is admin`);
            return result;
        } catch (error) {
            logger.error("Failed to fulfill auctioneer request", { account_id, user_id, error });
            throw new InternalServerErrorException("Error while becoming auctioneer");
        }
    }
}
