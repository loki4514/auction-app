import { Injectable } from "@nestjs/common";
import { first } from "rxjs";
import { IGetAuctionImageById } from "src/auctions/domain/repository/edit-auction-image.repository";
import { GetAuctionImageId } from "src/auctions/domain/types/auction-image.interface";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";

@Injectable()
export class GetAuctionImageById extends IGetAuctionImageById {
    constructor(
        private prisma: PrismaService,
    ) {
        super();
    }

    async getAuctionImageById(image_id: string, auction_id: string): Promise<GetAuctionImageId> {
        const image = await this.prisma.auction_image.findFirst({
            where: {
                image_id,
                auction_id,
            },
        });

        if (image) {
            return {
                auction_image_status: true,
                message: "Image found",
                status: 200,
                image_url: image.image_url,
            };
        }

        return {
            auction_image_status: false,
            message: "Image not found",
            status: 404,
        };
    }
}
