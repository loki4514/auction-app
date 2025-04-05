import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
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

// Custom request type extending Express Request to include `id`
interface AuthenticatedRequest extends Request {
    id: string; // Assuming id is a string, change to number if needed
}

@Controller('auction')
export class CreateAuctionController {
    constructor(private readonly createAuctionUseCase: CreateAuctionUsecase) { }

    @Post('create-auction')
    @UseGuards(AuctionGuard)
    @AdminOnly()
    @UsePipes(new ZodValidationPipe(AuctionDetailsSchema))
    async createAuction(@Body() body: AuctionDetailsDto, @Req() req: AuthenticatedRequest) {
        return await this.createAuctionUseCase.createAuction(body, req.id);
    }
}
