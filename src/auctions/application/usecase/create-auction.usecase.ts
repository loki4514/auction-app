import { 
    BadRequestException, 
    ConflictException, 
    ForbiddenException, 
    HttpException, 
    HttpStatus, 
    Injectable, 
    InternalServerErrorException 
} from "@nestjs/common";
import { auction_type } from "@prisma/client";
import * as moment from "moment-timezone";
import { IGetAuctionDetails } from "src/auctions/domain/repository/auction-details.repository";
import { IUploadAuction } from "src/auctions/domain/repository/upload-auction.respository";
import { TotalNoOfAuction } from "src/auctions/domain/types/auction-details.interface";
import { AuctionPlanDetails } from "src/auctions/domain/types/auction-plan.details.interface";
import { AuctionDetailsDto } from "src/auctions/interface/dtos/auction.dto";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";

@Injectable()
export class CreateAuctionUsecase {
    constructor(
        private readonly logger: ApplicationLogger,
        private readonly auctionDetails: IGetAuctionDetails,
        private readonly saveAuction: IUploadAuction,
    ) {}

    async getHostedAuctionCount(user_id: string): Promise<TotalNoOfAuction | null> {
        try {
            const result = await this.auctionDetails.getNoofAuction(user_id);
            if (!result.success) throw new InternalServerErrorException("Failed to fetch hosted auctions.");
            return result.no_of_hosted_auction;
        } catch (error) {
            this.logError("Fetching hosted auctions failed", error);
            return null;
        }
    }

    async getPlanDetails(user_id: string): Promise<AuctionPlanDetails | null> {
        try {
            const result = await this.auctionDetails.getAuctionDetails(user_id);
            if (!result.success) throw new InternalServerErrorException("Failed to fetch auction plan details.");
            return result.data ?? null;
        } catch (error) {
            this.logError("Fetching auction plan details failed", error);
            return null;
        }
    }

    validateAuctionLimits(current: number, limit: number, errorMessage: string): void {
        console.log(current, limit,"this is auction lmit")
        if (current >= limit) throw new ForbiddenException(errorMessage);
    }

    validateParticipants(planLimit: number, requested: number): void {
        if (requested > planLimit) 
            throw new BadRequestException(`Exceeded participant limit: Allowed ${planLimit}, but requested ${requested}.`);
    }

    async validateAuctionHosting(user_id: string, auctionDetails: AuctionDetailsDto) {
        const hostedAuctions = await this.getHostedAuctionCount(user_id);
        const planDetails = await this.getPlanDetails(user_id);

        if (!hostedAuctions || !planDetails) 
            throw new InternalServerErrorException("Failed to retrieve plan or hosted auction details.");

        if (auctionDetails.auction_type === "live") {
            this.validateAuctionLimits(
                hostedAuctions.live_auctions, planDetails.max_live_auctions, 
                "Maximum live auction limit reached. Upgrade your plan to host more auctions."
            );
        } else if (auctionDetails.auction_type === "timed") {
            this.validateAuctionLimits(
                hostedAuctions.timed_auctions, planDetails.max_timed_auctions, 
                "Maximum timed auction limit reached. Upgrade your plan to host more auctions."
            );
        }

        this.validateParticipants(planDetails.max_bidders, auctionDetails.max_participants);
        return planDetails;
    }

    generateAuctionId(user_id: string): string {
        const uniquePart = user_id.split("-").pop();
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `AUCTION${uniquePart}${randomString}`;
    }

    async generateUniqueAuctionId(user_id: string): Promise<string> {
        let auction_id = this.generateAuctionId(user_id);
        let retries = 5;

        while (retries > 0) {
            const isTaken = await this.auctionDetails.findUniqueAuctionId(auction_id);
            if (!isTaken) return auction_id;
            retries--;
            auction_id = this.generateAuctionId(user_id);
        }
        throw new ConflictException("Failed to generate a unique auction ID after multiple attempts.");
    }

    async createAuction(auctionDetails: AuctionDetailsDto, user_id: string) {
        try {
            const auction_id = await this.generateUniqueAuctionId(user_id);
            const planDetails = await this.validateAuctionHosting(user_id, auctionDetails);
    
            if (auctionDetails.auction_type === "timed" && !auctionDetails.auction_end_time) {
                auctionDetails.auction_end_time = moment().tz("UTC").add(planDetails.timed_auction_duration, "days").toDate();
            }
    
            const saveAuctionDetails = { id: auction_id, auctioneer_id: user_id, ...auctionDetails };
            const insertedAuction = await this.saveAuction.createAuction(saveAuctionDetails);
    
            if (!insertedAuction.insertion_flag) {
                throw new HttpException("Auction insertion failed. Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
    
            return { success: true, message: `${auctionDetails.auction_type} auction created successfully.`, auction_id };
        } catch (error) {
            
                console.error("UseCase Error:", error);
            
                if (error instanceof HttpException) {
                    console.log("thisis cominge under it", error)
                    throw new HttpException(
                        {
                            success: false,
                            error: error.getResponse() || "Bad Request", // Generic error name
                            status: error.getStatus(),
                            message: error.message // Detailed message
                        },
                        error.getStatus()
                    );
                }
            
                throw new HttpException(
                    {
                        success: false,
                        error: "Internal Server Error",
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        message: "An unexpected error occurred while creating the auction."
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            
        }
    }

    private logError(message: string, error: any) {
        this.logger.error(`${message}: ${error.message}`, error.stack);
    }
}
