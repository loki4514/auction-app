import { Controller, Get, Query } from "@nestjs/common";
import { GetAllAuctionUsecase } from "src/auctions/application/usecase/get-all-auctions.usecase";

@Controller('auction')
export class GetAuctionsController {
    constructor(private readonly auctionUsecase: GetAllAuctionUsecase) { }

    @Get('get-auctions')
    async getAllAuctions(
        @Query('page') pageQuery: string,
        @Query('limit') limitQuery: string
    ) {
        // Convert to numbers and apply fallback values if invalid
        let page = parseInt(pageQuery);
        let limit = parseInt(limitQuery);

        // If not a number or invalid, fallback to defaults
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1 || limit > 100) limit = 30;

        return this.auctionUsecase.getAllAuctions(page, limit);
    }
}
