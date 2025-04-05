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



@Module({
    imports : [AuthModule],
    controllers : [CreateAuctionController],
    providers : [ApplicationLogger,
        CreateAuctionUsecase,
        AuctionGuard,
        TokenService,
        PrismaService,
        GetAuctionDetailsRepository,
        UploadAuctionRepository,
        AuctionMappers,
        {
            provide : IGetAuctionDetails,
            useClass : GetAuctionDetailsRepository 
        },
        {
            provide : IUploadAuction,
            useClass : UploadAuctionRepository
        }
    ],
    exports : [CreateAuctionUsecase, ApplicationLogger, TokenService]

})

export class AuctionModule{}