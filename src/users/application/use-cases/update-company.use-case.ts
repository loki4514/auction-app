import { Injectable, HttpStatus } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { ApplicationLogger } from 'src/shared/infrastructure/logger/application.logger';
import { ICompanyRepository } from 'src/users/domain/repository/company.repository';
import { CompanyUpdateDto } from 'src/users/interface/dtos/company-update.dto';
import { UpdateAccountDTO } from "src/users/domain/entity/account.entity";
@Injectable()
export class CompanyService {
    constructor(
        private readonly companyRepository: ICompanyRepository,
        private readonly logger: ApplicationLogger,
    ) { }

    async updateCompany(companyDetails: CompanyUpdateDto, account_id : string) {
        const now = moment().tz('Asia/Kolkata').format();

        try {
            let update_detials : UpdateAccountDTO = { account_id : account_id, ...companyDetails }
            const updatedCount = await this.companyRepository.updateCompany(update_detials);

            if (!updatedCount) {
                this.logger.log(
                    `No company found to update at ${now}`,
                    CompanyService.name,
                );

                return {
                    success: false,
                    message: 'Company not found',
                    statusCode: HttpStatus.NOT_FOUND,
                };
            }

            this.logger.log(
                `Company updated successfully at ${now}`,
                CompanyService.name,
            );

            return {
                success: true,
                message: 'Company updated successfully',
                statusCode: HttpStatus.OK,
            };
        } catch (error) {
            this.logger.error(
                error,
                `Failed to update company at ${now}`,
                CompanyService.name,
            );

            return {
                success: false,
                message: 'Failed to update company',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
