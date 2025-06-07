import { Body, Controller, HttpException, HttpStatus, Post, Req, Patch, UseGuards, UsePipes, Param } from "@nestjs/common";
import { Request } from "express";
import { AdminOnly, AuctionGuard } from "src/auth/infrastructure/auth/guard/rabc.guard";
import { AuctionUpdateDetailsDto, AuctionUpdateDetailsSchema } from "../dtos/auction-update.dto";
import { ZodValidationPipe } from "src/shared/pipes/zod-validation.pipe";
import { UpdateAuctionUseCase } from "src/auctions/application/usecase/update-auction.usecase";

interface AuthenticatedRequest extends Request {
    id: string;
}

@Controller('auction')
export class UpdateAuctionController {
    constructor(private readonly updateService: UpdateAuctionUseCase) {}

    @Patch('update-auction/:auction_id')
    @UseGuards(AuctionGuard)
    @AdminOnly()
    async createAuction(
        @Body(new ZodValidationPipe(AuctionUpdateDetailsSchema)) body: AuctionUpdateDetailsDto, // Apply pipe only to body
        @Req() req: AuthenticatedRequest, 
        @Param("auction_id") auctionId: string
    ) {
        console.log("this is body", body);
        return await this.updateService.updateAuction({
            auction_id: auctionId, 
            auctioneer_id: req.id, 
            auction_params: body
        });
    }
}