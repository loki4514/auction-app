import { EditAuctionImage } from "src/auctions/domain/entity/auction-image.entity";
import { IEditAuctionImage } from "src/auctions/domain/repository/edit-auction-image.repository";
import { AuctionImageUpdation } from "src/auctions/domain/types/auction-image.interface";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";


export class EditAuctionImageRepository extends IEditAuctionImage {
    constructor(
        private readonly prisma: PrismaService
    ) {
        super();
    }

    async editAuctionImage(imageParams: EditAuctionImage): Promise<AuctionImageUpdation> {
        try {
            const updatedImage = await this.prisma.auction_image.update({
                where: { image_id: imageParams.image_id, auction_id: imageParams.auction_id },
                data: {
                    image_url: imageParams.image_url, // or whatever field you're updating
                }
            });

            return {
                auction_updated_status: true,
                status: 200,
                message: "Auction image updated successfully.",
            };
        } catch (error) {
            console.error(error);
            return {
                auction_updated_status: false,
                status: 500,
                message: "Failed to update auction image."
            };
        }
    }
}