import { Injectable } from "@nestjs/common";
import { IGetAllAuctions } from "src/auctions/domain/repository/get-auctions.repostory";
import { IGetAllAuction } from "src/auctions/domain/types/get-all-auction.interface";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";

@Injectable()
export class GetAllAuctions extends IGetAllAuctions {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // Method to get all hosted auctions with pagination
  async getAllAuctions(page: number, limit: number): Promise<IGetAllAuction> {
    console.log("thie is archihe ", page, limit)
    const offset = (page - 1) * limit;

    try {
      const auctions = await this.prisma.auction.findMany({
        skip: offset,
        take: limit,
        where: {
          auction_type: 'timed',
        },
        select: {
          auction_id: true,
          auction_name: true,
          auction_product_type: true,
          auction_details: true,
          max_participants: true,
          min_next_bid_increment: true,
          initial_bid_amount: true,
          currency: true,
          auction_type: true,
          auction_start_time: true,
          auction_end_time: true,
          status: true,
          created_at: true,
          images: {
            select: {
              image_id: true,
              image_url: true,
            },
          },
        },
      });


      const totalAuctions = await this.prisma.auction.count({
        where: {
          auction_type: 'timed',
        },
      });

      const totalPages = Math.ceil(totalAuctions / limit);

      return {
        success: true,
        status: 200,
        data: auctions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalAuctions,
        },
      };
    } catch (error) {
      console.log("Error fetching auctions:", error);
      return {
        success: false,
        status: 500,
        data: [],
        pagination: null
      };
    }
  }
}
