import { HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { IGetAllAuctions } from "src/auctions/domain/repository/get-auctions.repostory";
import { IAllAuctionResponse } from "src/auctions/domain/types/get-all-auction.interface";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";

@Injectable()
export class GetAllAuctionUsecase {
    constructor(
        private readonly logger: ApplicationLogger,
        private readonly getAuctions: IGetAllAuctions,
    ) {}

    async getAllAuctions(limit: number, page: number): Promise<IAllAuctionResponse> {
        try {
            this.logger.debug(`Fetching auctions with limit: ${limit}, page: ${page}`);

            const auctionData = await this.getAuctions.getAllAuctions(page, limit);

            if (!auctionData.success) {
                this.logger.warn("Auction service returned an error", String(auctionData));
                throw new HttpException({
                    success: false,
                    status: auctionData.status,
                    data : null,
                    message: "We're currently experiencing downtime and are unable to fetch auction details. Please try again later.",
                }, auctionData.status || 500);
            }

            if (!auctionData.data?.length) {
                return {
                    success: true,
                    status: 204,
                    message: "No auctions are available at the moment. Hang tight!",
                    data: []
                };
            }

            return {
                success: true,
                status: 200,
                message: "Auctions fetched successfully",
                data: auctionData.data,
                pagination : auctionData.pagination
            };

        } catch (error: any) {
            this.logger.error("Something went wrong while fetching auctions", error?.stack || error?.message || String(error));
            throw new HttpException({
                success: false,
                status: 500,
                message: "Error occurred while fetching auctions. Please try again later.",
                data : null
            },  500);
            
        }
    }
}
