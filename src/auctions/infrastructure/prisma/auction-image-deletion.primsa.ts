import { IDeleteAuctionImage } from "src/auctions/domain/repository/edit-auction-image.repository";
import { AuctionImageDeletion } from "src/auctions/domain/types/auction-image.interface";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";

export class DeleteAuctionImageRepository extends IDeleteAuctionImage {
    constructor(
        private readonly prisma: PrismaService
    ) {
        super();
    }

    async deleteAuctionImage(image_id: string): Promise<AuctionImageDeletion> {
        try {
            await this.prisma.auction_image.delete({
                where: { image_id }
            });

            return {
                auction_deleted_status: true,
                status: 200,
                message: "Auction image deleted successfully."
            };
        } catch (error) {
            // Handle case where image_id does not exist
            if (error.code === 'P2025') {
                // Prisma error code for "record to delete does not exist"
                return {
                    auction_deleted_status: false, // Treat as successful — id is already "gone"
                    status: 404,
                    message: "Image not found. Treated as already deleted."
                };
            }

            console.error(error);
            return {
                auction_deleted_status: false,
                status: 500,
                message: "Oops! Something went wrong while removing the auction image. Please try again soon."
            };
        }
    }
}
