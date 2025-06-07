import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuctionUpdateEntity } from "src/auctions/domain/entity/auction.entity";
import { IEditAuction } from "src/auctions/domain/repository/edit-auction.repository";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";

@Injectable()
export class UpdateAuctionUseCase {
    constructor(
        private readonly logger: ApplicationLogger,
        private readonly updateAuctiondetails: IEditAuction,
    ) {}

    async updateAuction(updateAuctionParams: AuctionUpdateEntity) {
        try {
            const updateRes = await this.updateAuctiondetails.updateAuctionDetails(updateAuctionParams);

            if (!updateRes.updation_flag) {
                throw new HttpException(
                    {
                        success: false,
                        message: updateRes.message,
                    },
                    updateRes?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                success: true,
                message: updateRes.message,
            };
        } catch (error) {
            this.logger.error(
                `Error occurred while updating auction details: ${error.message}`,
                error.stack,
            );
            throw new HttpException(
                {
                    success: false,
                    message: 'Auction update failed, please try again.',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
