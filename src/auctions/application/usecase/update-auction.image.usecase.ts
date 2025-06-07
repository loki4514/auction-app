import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { ControlTower } from 'aws-sdk';
import { IGetAuctionDetails } from 'src/auctions/domain/repository/auction-details.repository';
import { IDeleteAuctionImage, IEditAuctionImage, IGetAuctionImageById, IGetNumberOfAuctionImage } from 'src/auctions/domain/repository/edit-auction-image.repository';
import { IGetHostedAuctions } from 'src/auctions/domain/repository/get-auction.repository';
import { IUploadAuctionImage } from 'src/auctions/domain/repository/upload-auction-image.repository';
import { S3Service } from 'src/auctions/infrastructure/services/auction-image.service';
import { ApplicationLogger } from 'src/shared/infrastructure/logger/application.logger';

@Injectable()
export class AuctionImageUpdateUseCase {
    constructor(
        private logger: ApplicationLogger,
        private editAuctionImageService: IEditAuctionImage,
        private getimagebyId: IGetAuctionImageById,
        private fileUploadService: S3Service,
        private auctionDetails: IGetAuctionDetails,
        private auctions: IGetHostedAuctions,
        private uploadImageUrl: IUploadAuctionImage,
        private noOfImages: IGetNumberOfAuctionImage,
        private deleteAuctionImageService: IDeleteAuctionImage,
    ) { }

    async getauctionImage(image_id: string, auction_id: string): Promise<string | null> {
    try {
        const image_res = await this.getimagebyId.getAuctionImageById(
            image_id,
            auction_id,
        );
        if (!image_res.auction_image_status || !image_res.image_url) {
            this.logger.log(
                `Retrieving auction image failed. IMAGE_ID: ${image_id}, AUCTION_ID: ${auction_id}`,
            );
            throw new HttpException(
                {
                    success: false,
                    message: image_res.message,
                    status: image_res.status,
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return image_res.image_url;
    } catch (error) {
        this.logger.error(
            `❌ Error in getauctionImage() with IMAGE_ID: ${image_id}, AUCTION_ID: ${auction_id}`,
            error.stack,
        );
        
        // Re-throw the error instead of returning null
        throw error instanceof HttpException
            ? error
            : new HttpException(
                { success: false, message: 'Failed to retrieve auction image' },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
    }
}

    private validateImageCount(incoming: number, allowed: number): void {
        console.log(incoming, allowed, "this is acution images")


        if (incoming > allowed) {
            throw new BadRequestException(
                `Max ${allowed} images allowed for your plan.`,
            );
        }
    }

    async deleteAuctionImage(deleteImageParams: { image_id: string, auction_id: string }) {
        try {
            let image_url = await this.getauctionImage(deleteImageParams.image_id, deleteImageParams.auction_id)
            if (image_url) {
                // deleting auction images on file server 
                const file_res = await this.fileUploadService.deleteFiles([image_url]);
                if (!file_res) {
                    throw new HttpException(
                        { success: false, message: 'Auction Image Deletion Failed' }, HttpStatus.INTERNAL_SERVER_ERROR,
                    )
                }
                const deletion_image_res = await this.deleteAuctionImageService.deleteAuctionImage(deleteImageParams.image_id)
                console.log(deletion_image_res)
                if (!deletion_image_res.auction_deleted_status) {
                    throw new HttpException({
                        success: false, message: deletion_image_res.message
                    }, deletion_image_res.status)
                }
                return { success: true, message: deletion_image_res.message, status: 200 }
            }

        } catch (error) {
            this.logger.error('Something went wrong while deleting the auction image', error.stack)
            throw error instanceof HttpException
                ? error
                : new HttpException(
                    { success: false, message: 'Auction Image Deletion Failed' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );

        }
    }



    async replaceImage(uploadParams: {
        files: Express.Multer.File[];
        auction_id: string;
        image_id?: string;
        user_id: string;
        image_names: string[];
    }) {
        const { files, auction_id, image_id, image_names, user_id } = uploadParams;
        console.log(uploadParams, "thiis it")
        try {
            // === Case 1: Replace existing image ===
            if (image_id) {
                const image_url = await this.getauctionImage(image_id, auction_id);

                if (image_url) {
                    const deletionSuccess = await this.fileUploadService.deleteFiles([image_url]);
                    if (!deletionSuccess) {
                        throw new HttpException(
                            { success: false, message: 'Failed to delete old image from S3. Try again later.' },
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        );
                    }

                    const new_image_urls = await this.fileUploadService.uploadFiles(
                        files,
                        user_id,
                        auction_id,
                        image_names,
                    );

                    if (new_image_urls.length === 0) {
                        throw new HttpException(
                            { success: false, message: 'Failed to upload auction image.' },
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        );
                    }

                    const upload_res = await this.editAuctionImageService.editAuctionImage({
                        image_id,
                        auction_id,
                        image_url: new_image_urls[0],
                    });

                    if (!upload_res.auction_updated_status) {
                        throw new HttpException(
                            { success: false, message: upload_res.message, status: upload_res.status },
                            upload_res.status,
                        );
                    }

                    return {
                        success: true,
                        message: upload_res.message,
                        status: upload_res.status,
                    };
                }
            }

            // === Case 2: Upload new image ===
            const auctionDetails = await this.auctionDetails.getAuctionDetails(user_id);
            const noOfImageRes = await this.noOfImages.getNumberOfAuctionIMage(auction_id);
            console.log(noOfImageRes,"this is it", auctionDetails)

            if (!auctionDetails.success || !auctionDetails.data) {
                throw new HttpException(
                    { success: false, message: auctionDetails.message },
                    auctionDetails.status,
                );
            }

            if (!noOfImageRes.auction_image_status || typeof noOfImageRes.no_of_images !== 'number') {
                throw new HttpException(
                    { success: false, message: noOfImageRes.message },
                    noOfImageRes.status,
                );
            }

            // ✅ Validate total images
            this.validateImageCount(
                noOfImageRes.no_of_images + files.length,
                auctionDetails.data.max_images_per_auction,
            );

            const uploadedUrls = await this.fileUploadService.uploadFiles(
                files,
                user_id,
                auction_id,
                image_names,
            );

            if (uploadedUrls.length === 0) {
                throw new HttpException(
                    { success: false, message: 'Failed to upload auction image.' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            const saveToDb = await this.uploadImageUrl.uploadAuctionImage({
                auction_id,
                image_url: uploadedUrls,
            });

            if (saveToDb.status === 400) {
                await this.fileUploadService.deleteFiles(uploadedUrls);
                throw new BadRequestException(saveToDb.message);
            }

            if (!saveToDb.auction_insert_status && saveToDb.status !== 200) {
                await this.fileUploadService.deleteFiles(uploadedUrls);
                throw new HttpException(
                    { success: false, message: 'Failed to save auction image to DB.' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                success: true,
                message: 'Auction image uploaded successfully',
                urls: uploadedUrls,
            };
        } catch (error) {
            this.logger.error('Error in replaceImage()', error.stack);
            throw error instanceof HttpException
                ? error
                : new HttpException(
                    { success: false, message: 'Image replacement failed.' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }
    }
}
