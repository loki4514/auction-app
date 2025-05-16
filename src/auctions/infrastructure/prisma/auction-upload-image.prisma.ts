import { AuctionImage } from "src/auctions/domain/entity/auction-image.entity";
import { IUploadAuctionImage } from "src/auctions/domain/repository/upload-auction-image.repository";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import * as moment from 'moment-timezone';
import { AuctionImageInsertion } from "src/auctions/domain/types/auction-image.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class uploadAuctionImageRepository extends IUploadAuctionImage {
    private timezone = process.env.CURRENT_TIME_ZONE_MOMENT_PKG || 'Asia/Kolkata';

    constructor(
        private readonly prisma: PrismaService
    ) {
        super();
    }

    async uploadAuctionImage(imageparams: AuctionImage) : Promise<AuctionImageInsertion> {
        try {
            const currentTime = moment().tz(this.timezone).toDate();

            const insertData = imageparams.image_url.map((url) => ({
                auction_id: imageparams.auction_id,
                image_url: url,
                uploaded_at : currentTime,
            }));

            console.log("this is insertdata", insertData)

            const result = await this.prisma.auction_image.createMany({
                data: insertData,
                skipDuplicates: false,
            });

            console.log(result,"thisis reul")

            if (result.count > 0) {
                return {
                    auction_insert_status: true,
                    status : 200,
                    message:"image added successfully", 
                };
            } else {
                return {
                    auction_insert_status: false,
                    status : 400,
                    message: 'Auction image(s) inserted successfully'
                };
            }
        } catch (error) {
            console.log('Error inserting auction images:', error);
            return {
                auction_insert_status: false,
                status : 500,
                message: 'Failed to insert auction images'
            };
        }
    }
}
