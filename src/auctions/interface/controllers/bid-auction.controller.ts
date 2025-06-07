import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    Req,
    UseGuards,
    Param
} from "@nestjs/common";
import { Request } from "express";
import { BidAuctionUsecase } from "src/auctions/application/usecase/bid-auction.usecase";
import { AuctionStatusGuard } from "src/auctions/infrastructure/guards/auction-bid.guard";
import { JwtAuthGuard } from "src/auth/infrastructure/auth/guard/jwt-auth.guard";

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        account_status: string;
        user_role: string;
    };
}

@Controller("auction")
export class BidAuctionController {
    constructor(private readonly bidAuctionService: BidAuctionUsecase) {}

    @Post("bid-auction/:auctionId")
    @UseGuards(JwtAuthGuard)
    @UseGuards(AuctionStatusGuard)
    async bidAuction(
        @Req() req: AuthenticatedRequest,
        @Body("amount") amount: number,
        @Param("auctionId") auctionId: string
    ) {
        console.log(req.user)
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            throw new HttpException("Invalid bid amount", HttpStatus.BAD_REQUEST);
        }

        try {
            return await this.bidAuctionService.bidAuction({
                user_id: userId,
                auction_id: auctionId,
                amount
        });


        } catch (err) {
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
