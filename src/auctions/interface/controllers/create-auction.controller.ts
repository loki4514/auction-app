import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
    UsePipes
} from "@nestjs/common";
import { Request } from "express";
import { CreateAuctionUsecase } from "src/auctions/application/usecase/create-auction.usecase";
import { AdminOnly, AuctionGuard } from "src/auth/infrastructure/auth/guard/rabc.guard";
import { ZodValidationPipe } from "src/shared/pipes/zod-validation.pipe";
import { AuctionDetailsDto, AuctionDetailsSchema } from "../dtos/auction.dto";

// ✅ Extend Express Request to include user & account data from guard
interface AuthenticatedRequest extends Request {
    user_id: string;
    account_id: string;
    user_role: string;
}

@Controller("auction")
export class CreateAuctionController {
    constructor(private readonly createAuctionUseCase: CreateAuctionUsecase) {}

    @Post("create-auction")
    @UseGuards(AuctionGuard)
    @AdminOnly()
    @UsePipes(new ZodValidationPipe(AuctionDetailsSchema))
    async createAuction(
        @Body() auctionDetails: AuctionDetailsDto,
        @Req() req: AuthenticatedRequest
    ) {
        // ✅ Pass `auctionDetails`, `user_id`, `account_id`, and `request`
        return await this.createAuctionUseCase.createAuction(
            auctionDetails,
            req.user_id,
            req.account_id,
            req
        );
    }
}
