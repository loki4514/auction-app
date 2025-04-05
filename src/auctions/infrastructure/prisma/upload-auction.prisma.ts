import { AuctionEntity } from "src/auctions/domain/entity/auction.entity";
import { IUploadAuction } from "src/auctions/domain/repository/upload-auction.respository";
import { AuctionInsertionReponse } from "src/auctions/domain/types/auction-insertion.interface";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { AuctionMappers } from "../mappers/auctions-mapper";
import { Prisma } from "@prisma/client"; // Import Prisma error handling
import { Injectable } from "@nestjs/common";


@Injectable()
export class UploadAuctionRepository extends IUploadAuction {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auctionMapper: AuctionMappers
    ) {
        super();
    }

    async createAuction(auctionParams: AuctionEntity): Promise<AuctionInsertionReponse> {
        try {
            // Convert AuctionEntity to Prisma format
            const mappedPrismaData = this.auctionMapper.ToORM(auctionParams);

            // Insert auction into database
            const insertedData = await this.prisma.auction.create({
                data: mappedPrismaData,
            });

            return {
                insertion_flag: true,
                duplicate: false,  // No duplicate found
                message: "Auction inserted successfully",
                status: 201
            };
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    console.warn("Duplicate auction detected:", error.meta);

                    return {
                        insertion_flag: false,
                        duplicate: true,  // Duplicate found
                        message: "Duplicate auction detected",
                        status: 409, // Conflict status
                    };
                }
            }

            console.error("Error occurred while uploading the auction:", error);
            return {
                insertion_flag: false,
                duplicate: false,  // Not a duplicate error
                message: "Failed to insert the auction, please try again later",
                status: 500,
            };
        }
    }
}
