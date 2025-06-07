import {
    Controller,
    Delete,
    Post,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    Query,
    Param
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/auctions/infrastructure/guards/file-validation.guard';
import { Request } from 'express';
import { AdminOnly, AuctionGuard } from 'src/auth/infrastructure/auth/guard/rabc.guard';
import { AuctionImageUpdateUseCase } from 'src/auctions/application/usecase/update-auction.image.usecase';

interface AuthenticatedRequest extends Request {
    id: string; // Assuming user ID is a string
}

@Controller('auction')
export class AuctionImageUpdateController {
    constructor(
        private readonly updateImageUseCase: AuctionImageUpdateUseCase,
    ) {}

    @Post('update_auction_image/:auctionId')
    @UseGuards(AuctionGuard)
    @AdminOnly()
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFiles(
        @Req() req: AuthenticatedRequest,
        @Param('auctionId') auctionId: string,
        @UploadedFiles(new ImageValidationPipe()) files: Express.Multer.File[],
        @Query('imageId') imageId?: string,
    ) {
        const userId = req.id;
        console.log("this is imageid", imageId ?? 'No imageId provided');

        const imageNames = files.map((file, index) => {
            return `image-${Date.now()}-${index}`;
        });

        return await this.updateImageUseCase.replaceImage({
            user_id: userId,
            auction_id: auctionId,
            files,
            image_names: imageNames,
            image_id: imageId, // Optional
        });
    }

    @Delete('delete_auction_image/:auctionId/:imageId')
    @UseGuards(AuctionGuard)
    @AdminOnly()
    async deleteAuctionImage(
        @Req() req: AuthenticatedRequest,
        @Param('auctionId') auctionId: string,
        @Param('imageId') imageId: string,
    ) {
        const userId = req.id;

        return await this.updateImageUseCase.deleteAuctionImage({
            auction_id: auctionId,
            image_id: imageId,
        });
    }
}
