import {
    Controller,
    Req,
    UseGuards,
    Param,
    Get
} from "@nestjs/common";
import { Request } from "express";
import { GetBidsUsecase } from "src/auctions/application/usecase/get-bid-auction.usecase";
import { JwtAuthGuard } from "src/auth/infrastructure/auth/guard/jwt-auth.guard";
import { AuctionStatusGuard } from "src/auctions/infrastructure/guards/auction-bid.guard";

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        account_status: string;
        user_role: string;
    };
}


@Controller("auction")
export class AuctionBidsDetailsController {
    constructor(private readonly auctionBidDetails: GetBidsUsecase) { }

    @Get("get-highest-bid/:auctionId")
    @UseGuards(JwtAuthGuard)
    @UseGuards(AuctionStatusGuard)
    async getHighestBidController(
        @Param("auctionId") auctionId: string
    ) {
        return this.auctionBidDetails.getHighestBid(auctionId)
    }

    @Get("get-all-bids/:auctionId")
    @UseGuards(JwtAuthGuard)
    @UseGuards(AuctionStatusGuard)
    async getAllBidController(
        @Param("auctionId") auctionId: string
    ) {
        return this.auctionBidDetails.getAllbids(auctionId)
    }

    @Get("get-user-bids/:auctionId")
    @UseGuards(JwtAuthGuard)
    @UseGuards(AuctionStatusGuard)
    async getAllUserBidsController(
        @Req() req: AuthenticatedRequest,
        @Param("auctionId") auctionId: string
    ) {
        const userId = req.user.id;
        return this.auctionBidDetails.getCurrentUserBid(auctionId, userId)
    }


}