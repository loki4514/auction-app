import {
    Controller,
    Post,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuctionImageUploadUseCase } from 'src/auctions/application/usecase/insert-auction-image.usecase';
import { ImageValidationPipe } from 'src/auctions/infrastructure/guards/file-validation.guard';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/infrastructure/auth/guard/jwt-auth.guard';
import { AdminOnly, AuctionGuard } from 'src/auth/infrastructure/auth/guard/rabc.guard';

interface AuthenticatedRequest extends Request {
    id: string; // Assuming id is a string, change to number if needed
}


@Controller('auction')
export class AuctionImageUploadController {
    constructor(
        private readonly uploadUseCase: AuctionImageUploadUseCase,
    ) {}

    @Post('upload/:auctionId')
    @UseGuards(AuctionGuard)
    @AdminOnly()
    @UseInterceptors(FilesInterceptor('files')) // plural, for multiple files
    async uploadFiles(
        @Req() req: AuthenticatedRequest,
        @UploadedFiles(new ImageValidationPipe()) files: Express.Multer.File[],
    ) {
        console.log(files,"this is s nt", req)
        const userId = req.id;
        console.log("this is it r",req.id)
        const auction_id = req.params.auctionId;

        // Generate unique image names with original extension
        const imageNames = files.map((file, index) => {
            const ext = file.originalname.split('.').pop(); // Extract extension
            return `image-${Date.now()}-${index}`; // Unique name with timestamp
        });

        // Send to the UseCase for processing
        return await this.uploadUseCase.uploadAuctionImage({
            user_id: userId,
            auction_id,
            files,
            image_names: imageNames,
        });
    }
}
