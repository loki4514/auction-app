import { Injectable } from "@nestjs/common";
import { IGetNumberOfAuctionImage } from "src/auctions/domain/repository/edit-auction-image.repository";
import { NoOfAuctionImages } from "src/auctions/domain/types/auction-image.interface";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";

@Injectable()
export class GetNumberofAuctionImagesRepository extends IGetNumberOfAuctionImage {
    constructor(
        private readonly prisma: PrismaService
    ) {
        super();
    }

    async getNumberOfAuctionIMage(auction_id: string): Promise<NoOfAuctionImages> {
        try {
            const count = await this.prisma.auction_image.count({
                where: { auction_id },
            });

            return {
                auction_image_status: true,
                message: "Images counted successfully",
                status: 200,
                no_of_images: count,
            };
        } catch (error) {
            console.error(error);
            return {
                auction_image_status: false,
                message: "Failed to count images",
                status: 500,
            };
        }
    }
}
