import { AuctionUpdateEntity } from "src/auctions/domain/entity/auction.entity";
import { AuctionUpdateReponse } from "src/auctions/domain/types/auction-insertion.interface";
import { IEditAuction } from "../../domain/repository/edit-auction.repository";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";


export class UpdateAuctionRepository extends IEditAuction {
    constructor(private prisma: PrismaService) {
        super();
    }

    async updateAuctionDetails(updateParams: AuctionUpdateEntity): Promise<AuctionUpdateReponse> {
        const { auction_id, auction_params, auctioneer_id } = updateParams;

        try {
            const auction = await this.prisma.auction.findFirst({
                where: {
                    auction_id,
                    auctioneer_id
                }
            });

            if (!auction) {
                return {
                    updation_flag: false,
                    message: "Auction not found for the provided auction_id and auctioneer_id",
                    status: 404
                };
            }

            await this.prisma.auction.update({
                where: { auction_id },
                data: auction_params
            });

            return {
                updation_flag: true,
                message: "Auction updated successfully",
                status: 200
            };
        } catch (error) {
            // Optional: Log error if needed
            return {
                updation_flag: false,
                message: "Error occurred while updating auction details. Please try again later.",
                status: 500
            };
        }
    }
}