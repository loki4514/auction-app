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



@Module({
    imports : [AuthModule],
    controllers : [CreateAuctionController, AuctionImageUploadController, GetAuctionsController],
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
        }
    ],
    exports : [CreateAuctionUsecase, ApplicationLogger, TokenService, AuctionImageUploadUseCase, S3Service, GetAllAuctionUsecase]

})

export class AuctionModule{}