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
import { UpdateCompanyService } from "src/users/application/use-cases/update-company.use-case";
import { CompanyUpdateDto, CompanyUpdateSchema } from "../dtos/company-update.dto";
import { BecomeAuctioneerService } from "src/users/application/use-cases/become-autioneer.use-case";

@Controller("company")
export class UpdateCompanyController {
    constructor(
        private readonly logger: ApplicationLogger,
        private readonly companyUpdateService: UpdateCompanyService,
        private readonly becomeAuctioneerService: BecomeAuctioneerService
    ) { }

    @Patch("update-company/:company_id")
    @UsePipes(new ZodValidationPipe(CompanyUpdateSchema))
    async updateCompanyHandler(
        @Param("company_id") company_id: string,
        @Body() body: CompanyUpdateDto
    ) {
        try {
            const update_response = await this.companyUpdateService.updateCompany(
                body,
                company_id
            );

            return {
                success: true,
                message: "Company updated successfully",
                data: update_response
            };
        } catch (error) {
            this.logger.error(
                `Failed to update company ${company_id}`,
                error.stack,
                "UpdateCompanyController"
            );
            throw new HttpException(
                {
                    success: false,
                    message: "Unable to update company. Please try again later.",
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Patch("become-auctioneer/:company_id/:user_id")
    @UsePipes(new ZodValidationPipe(CompanyUpdateSchema))
    async becomeAuctioneerHandle(
        @Param("company_id") company_id: string,
        @Param("user_id") user_id: string
    ) {
        try {
            const update_response = await this.becomeAuctioneerService.becomeAuctioneer(
                
                company_id,
                user_id
            );

            return {
                success: true,
                message: "Company updated successfully",
                data: update_response
            };
        } catch (error) {
            this.logger.error(
                `Failed to update account ${company_id} for user ${user_id}`,
                error.stack,
                "UpdateCompanyController"
            );
            throw new HttpException(
                {
                    success: false,
                    message: "Unable to update company. Please try again later.",
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }




}
