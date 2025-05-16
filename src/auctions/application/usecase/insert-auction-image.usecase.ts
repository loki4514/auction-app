import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { IGetAuctionDetails } from 'src/auctions/domain/repository/auction-details.repository';
import { IGetHostedAuctions } from 'src/auctions/domain/repository/get-auction.repository';
import { IUploadAuctionImage } from 'src/auctions/domain/repository/upload-auction-image.repository';
import { S3Service } from 'src/auctions/infrastructure/services/auction-image.service';
import { ApplicationLogger } from 'src/shared/infrastructure/logger/application.logger';

@Injectable()
export class AuctionImageUploadUseCase {
    constructor(
        private logger: ApplicationLogger,
        private auctionDetails: IGetAuctionDetails,
        private auctions: IGetHostedAuctions,
        private uploadImageUrl: IUploadAuctionImage,
        private filesUploadService: S3Service,
    ) {}

    private validateImageCount(incoming: number, allowed: number): void {
        if (incoming > allowed) {
            throw new BadRequestException(
                `Max ${allowed} images allowed for your plan.`,
            );
        }
    }

    private async validateAuctionId(auction_id: string): Promise<void> {
        const auction = await this.auctions.getauctionByAuctionId(auction_id);
        if (!auction) {
            throw new NotFoundException('Provided auction ID is invalid, please verify it');
        }
    }

    private async saveImageUrlsWithRetry(auction_id: string, image_url: string[]): Promise<void> {
        let retries = 0;
        while (retries < 3) {
            const result = await this.uploadImageUrl.uploadAuctionImage({ auction_id, image_url });

            if (result.status === 400) {
                await this.filesUploadService.deleteFiles(image_url)
                throw new BadRequestException(result.message);
            }

            if (result.auction_insert_status || result.status === 200) {
                return; // success
            }

            retries++;
            this.logger.warn(
                `Retry ${retries} → Failed to save auction image to DB for auction_id: ${auction_id}`,
                JSON.stringify(result),
            );

            if (retries === 3) {
                this.logger.error(
                    `Final retry failed → Unable to save auction image URLs for auction_id: ${auction_id}`,
                    JSON.stringify(result),
                );
                await this.filesUploadService.deleteFiles(image_url)
                throw new InternalServerErrorException(
                    'Failed to save auction image URLs after multiple attempts.',
                );
            }
        }
    }

    async uploadAuctionImage(
        uploadParams: {
            files: Express.Multer.File[];
            auction_id: string;
            user_id: string;
            image_names: string[];
        }
    ) {
        const {files, auction_id, user_id, image_names} = uploadParams
        try {
            // Fetch plan details
            console.log("yo man i'm getting user_id",user_id)
            if (!user_id) {
                        throw new BadRequestException('User ID is missing from the request');
                    }
            const auctionDetails = await this.auctionDetails.getAuctionDetails(user_id);
            const details = auctionDetails.data;

            if (!auctionDetails.success || !details) {
                throw new HttpException(
                    { success: false, message: auctionDetails.message },
                    auctionDetails.status,
                );
            }

            // Validate constraints
            this.validateImageCount(files.length, details.max_images_per_auction);
            await this.validateAuctionId(auction_id);

            // Upload to S3
            const uploadedUrls = await this.filesUploadService.uploadFiles(
                files,
                user_id,
                auction_id,
                image_names,
            );

            if (uploadedUrls.length === 0) {
                throw new HttpException(
                    { success: false, message: 'Failed to upload auction images to S3.' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // Save to DB with retry
            await this.saveImageUrlsWithRetry(auction_id, uploadedUrls);

            return {
                success: true,
                message: 'Auction images uploaded successfully',
                urls: uploadedUrls,
            };
        } catch (error) {
            this.logger.error(
                `Upload failed for auction [${auction_id}]`,
                error.stack,
            );
            throw new HttpException(
                { success: false, message: 'Image upload failed, please try again.' },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
