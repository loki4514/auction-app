import { Injectable } from "@nestjs/common";
import { IGetHostedAuctions } from "src/auctions/domain/repository/get-auction.repository";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";

@Injectable()
export class GetAuctionsRepository extends IGetHostedAuctions {
    constructor(
        private readonly prisma: PrismaService // typo fixed from "primsa"
    ) {
        super();
    }

    async getauctionByAuctionId(auction_id: string): Promise<boolean> {
        const auction = await this.prisma.auction.findUnique({
            where: {
                auction_id: auction_id,
            },
            select: {
                auction_id: true, // we just need to confirm existence
            },
        });

        return !!auction; // returns true if found, false if null
    }
}
