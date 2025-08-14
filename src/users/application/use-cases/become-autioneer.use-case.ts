import { Injectable, HttpStatus } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { ApplicationLogger } from 'src/shared/infrastructure/logger/application.logger';
import { ICompanyRepository } from 'src/users/domain/repository/company.repository';

@Injectable()
export class AuctionService {
    constructor(
        private readonly companyRepository: ICompanyRepository,
        private readonly logger: ApplicationLogger,
    ) { }

    async becomeAuctioneer(
        account_id: string,
        user_id: string,
    ): Promise<{ success: boolean; message: string; status: number }> {
        const now = moment().tz('Asia/Kolkata').format();

        if (!account_id || !user_id) {
            this.logger.log(
                `Failed to become auctioneer — Missing account_id or user_id at ${now}`,
                AuctionService.name,
            );
            return {
                success: false,
                message: 'Missing account_id or user_id',
                status: HttpStatus.BAD_REQUEST,
            };
        }

        try {
            this.logger.debug(
                `Attempting to make user ${user_id} an auctioneer for account ${account_id} at ${now}`,
            );

            const repoResult = await this.companyRepository.becomeAuctioneer(account_id, user_id);

            if (!repoResult) {
                this.logger.log(
                    `Failed to become auctioneer for account ${account_id} and user ${user_id} at ${now}`,
                    AuctionService.name,
                );
                return {
                    success: false,
                    message: 'Failed to become auctioneer',
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                };
            }

            this.logger.log(
                `User ${user_id} became an auctioneer for account ${account_id} at ${now}`,
                AuctionService.name,
            );
            return {
                success: true,
                message: 'Auctioneer role assigned successfully',
                status: HttpStatus.OK,
            };
        } catch (error) {
            this.logger.error(
                error,
                `Error while making user ${user_id} an auctioneer for account ${account_id} at ${now}`,
                AuctionService.name,
            );
            return {
                success: false,
                message: 'An error occurred while becoming auctioneer',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
