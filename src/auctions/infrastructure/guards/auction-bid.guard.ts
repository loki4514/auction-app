import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { IGetAllAuctions } from 'src/auctions/domain/repository/get-auctions.repostory';

@Injectable()
export class AuctionStatusGuard implements CanActivate {
    constructor(
        private readonly auctionService: IGetAllAuctions
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        console.log("auction id params", request.auctionId, request.params.auctionId)
        const auctionId = request.params.auctionId;

        const auction_res = await this.auctionService.getAuctionById(auctionId);

        if (!auction_res.success || !auction_res.data) throw new ForbiddenException('Auction not found');

        // Check the status
      
        if (auction_res.data.status === "ongoing") {
            return true;
        } else {
            throw new ForbiddenException('Auction is not active');
        }
    }

}