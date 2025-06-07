import { Module } from "@nestjs/common";
import { AuctionGuard } from "src/auth/infrastructure/auth/guard/rabc.guard";
import { CreateAuctionController } from "./interface/controllers/create-auction.controller";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { CreateAuctionUsecase } from "./application/usecase/create-auction.usecase";
import { GetAuctionDetailsRepository } from "./infrastructure/prisma/auction-details.prisma";
import { UploadAuctionRepository } from "./infrastructure/prisma/upload-auction.prisma";
import { IGetAuctionDetails } from "./domain/repository/auction-details.repository";
import { IUploadAuction } from "./domain/repository/upload-auction.respository";
import { AuctionMappers } from "./infrastructure/mappers/auctions-mapper";
import { TokenService } from "src/shared/utils/token.service";
import { AuthModule } from "src/auth/auth.module";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { AuctionImageUploadController } from "./interface/controllers/upload-auction-image.controller";
import { IUploadAuctionImage } from "./domain/repository/upload-auction-image.repository";
import { uploadAuctionImageRepository } from "./infrastructure/prisma/auction-upload-image.prisma";
import { GetAuctionsRepository } from "./infrastructure/prisma/get-auctions.prisma";
import { IGetHostedAuctions } from "./domain/repository/get-auction.repository";
import { AuctionImageUploadUseCase } from "./application/usecase/insert-auction-image.usecase";
import { S3Service } from "./infrastructure/services/auction-image.service";
import { GetAuctionsController } from "./interface/controllers/get-all-auctions.controller";
import { IGetAllAuctions } from "./domain/repository/get-auctions.repostory";
import { GetAllAuctions } from "./infrastructure/prisma/get-all-auctions.prisma";
import { GetAllAuctionUsecase } from "./application/usecase/get-all-auctions.usecase";
import { IDeleteAuctionImage, IEditAuctionImage, IGetAuctionImageById, IGetNumberOfAuctionImage } from "./domain/repository/edit-auction-image.repository";
import { EditAuctionImageRepository } from "./infrastructure/prisma/edit-auction-image";
import { GetNumberofAuctionImagesRepository } from "./infrastructure/prisma/auction-total-image.prisma";
import { RedisModule } from "src/shared/redis.module";
import { IEditAuction } from "./domain/repository/edit-auction.repository";
import { UpdateAuctionRepository } from "./infrastructure/prisma/update-auction.prisma";
import { DeleteAuctionImageRepository } from "./infrastructure/prisma/auction-image-deletion.primsa";
import { AuctionImageUpdateController } from "./interface/controllers/update-auction-image.controller";
import { AuctionImageUpdateUseCase } from "./application/usecase/update-auction.image.usecase";
import { GetAuctionImageById } from "./infrastructure/prisma/get-auction-image-by-id.prisma";
import { UpdateAuctionController } from "./interface/controllers/update-auction.controller";
import { UpdateAuctionUseCase } from "./application/usecase/update-auction.usecase";
import { BidAuctionController } from "./interface/controllers/bid-auction.controller";
import { BidAuctionUsecase } from "./application/usecase/bid-auction.usecase";



@Module({
    imports : [AuthModule, RedisModule],
    controllers : [CreateAuctionController, AuctionImageUploadController, GetAuctionsController, 
        AuctionImageUpdateController, UpdateAuctionController, BidAuctionController],
    providers : [ApplicationLogger,
        CreateAuctionUsecase,
        AuctionImageUploadUseCase,
        GetAllAuctionUsecase,
        AuctionGuard,
        TokenService,
        PrismaService,
        GetAuctionDetailsRepository,
        UploadAuctionRepository,
        AuctionMappers,
        uploadAuctionImageRepository,
        GetAuctionsRepository,
        GetAllAuctions,
        S3Service,
        EditAuctionImageRepository,
        GetNumberofAuctionImagesRepository,
        DeleteAuctionImageRepository,
        AuctionImageUpdateUseCase,
        UpdateAuctionUseCase,
        GetAuctionImageById,
        BidAuctionUsecase,
        {
            provide : IGetAuctionDetails,
            useClass : GetAuctionDetailsRepository 
        },
        {
            provide : IUploadAuction,
            useClass : UploadAuctionRepository
        },
        {
            provide : IUploadAuctionImage,
            useClass : uploadAuctionImageRepository
        },
        {
            provide : IGetHostedAuctions,
            useClass : GetAuctionsRepository
        },
        {
            provide : IGetAllAuctions,
            useClass : GetAllAuctions
        },
        {
            provide : IEditAuctionImage,
            useClass : EditAuctionImageRepository,
        },
        {
            provide : IGetNumberOfAuctionImage,
            useClass : GetNumberofAuctionImagesRepository
        },
        {
            provide : IEditAuction,
            useClass : UpdateAuctionRepository
        },
        {
            provide : IDeleteAuctionImage,
            useClass : DeleteAuctionImageRepository
        },
        {
            provide : IGetAuctionImageById,
            useClass : GetAuctionImageById
        }
    ],
    exports : [CreateAuctionUsecase, ApplicationLogger, TokenService, AuctionImageUploadUseCase, S3Service, GetAllAuctionUsecase,
        AuctionImageUpdateUseCase,UpdateAuctionUseCase, BidAuctionUsecase
    ]

})

export class AuctionModule{}