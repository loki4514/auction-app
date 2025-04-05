import { IGetAuctionDetails } from "src/auctions/domain/repository/auction-details.repository";
import { getNoofAuction } from "src/auctions/domain/types/auction-details.interface";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import * as moment from "moment-timezone";
import { getDetails } from "src/shared/types/prisma.types";
import { AuctionPlanDetails } from "src/auctions/domain/types/auction-plan.details.interface";
import { Injectable, InternalServerErrorException } from "@nestjs/common";


@Injectable()
export class GetAuctionDetailsRepository extends IGetAuctionDetails {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: ApplicationLogger
    ) {
        super();
    }

    async findUniqueAuctionId(auction_id: string): Promise<boolean> {
        try {
            console.log("i amg getting auction id ", auction_id)
            const existingAuction = await this.prisma.auction.findUnique({
                where: { auction_id : auction_id },  // Checking for this specific auction_id
                select: { auction_id: true },
            });

    
            return existingAuction !== null; // Returns true if found, false if unique
        } catch (error) {
            console.log(error)
            this.logger.error(`Error checking uniqueness for auction ID : ${error?.message}`, error.stack);
            throw new InternalServerErrorException("Database error while checking auction ID.");
        }
    }
    


    async getNoofAuction(user_id: string): Promise<getNoofAuction> {
        try {
            // Fetch user's account creation date
            const user = await this.prisma.accounts.findUnique({
                where: { account_id: user_id },
                select: { created_at: true },
            });

            if (!user) {
                return {
                    success: false,
                    status: 404,
                    no_of_hosted_auction: null,
                };
            }

            const accountCreationDate = user.created_at;
            const startDate = moment(accountCreationDate).startOf("day").toDate();

            // Count auctions hosted by user from their account creation date onward
            const no_of_auction = await this.prisma.auction.groupBy({
                by: ["auction_type"],
                where: {
                    auctioneer_id: user_id,
                    created_at: {
                        gte: startDate,
                    },
                },
                _count: {
                    auction_id: true,
                },
            });

            const result = {
                live_auctions: 0,
                timed_auctions: 0,
                total_no_of_auctions : 0,
            };
            
            no_of_auction.forEach((item) => {
                if (item.auction_type === "live") {
                    result.live_auctions = item._count.auction_id;
                } else if (item.auction_type === "timed") {
                    result.timed_auctions = item._count.auction_id;
                }
            });

            result.total_no_of_auctions = result.live_auctions + result.timed_auctions



            return {
                success: true,
                status: 200,
                no_of_hosted_auction: result,
            };
        } catch (error) {
            this.logger.error(`Error fetching auction details: ${error}`, error.stack);
            return {
                success: false,
                status: 500,
                no_of_hosted_auction: null,
            };
        }
    }

    async getAuctionDetails(user_id: string): Promise<getDetails<AuctionPlanDetails | null>> {
        try {
            const subscriptions = await this.prisma.user_subscription.findMany({
                where: {
                    user_id: user_id,
                    status: "active",
                },
                include: {
                    plan: true,
                },
            });

            if (subscriptions.length > 0 && subscriptions[0].plan) {
                const plan = subscriptions[0].plan;

                return {
                    success: true,
                    status: 200,
                    message: "Plan details found",
                    data: {
                        max_auction_per_month: plan.auctions_per_month || 5,
                        max_images: plan.max_images || 50,
                        max_hosts: plan.max_hosts || 5,
                        max_bidders: plan.max_bidders || 50,
                        max_videos: plan.max_videos || 5,
                        max_storage_limit_in_gb: plan.storage_limit_gb || 10,
                        max_live_auctions: plan.max_live_auctions || 3,
                        max_timed_auctions: plan.max_timed_auctions || 10,
                        timed_auction_duration: plan.timed_auction_duration || 3,
                        analytics_features: plan.extra_features || "Basic analytics",
                    },
                };
            }

            // If no active plan is found, return default values
            return {
                success: true,
                status: 200,
                message: "No active plan found. Returning default limits.",
                data: {
                    max_auction_per_month: 5,
                    max_images: 50,
                    max_hosts: 5,
                    max_bidders: 50,
                    max_videos: 5,
                    max_storage_limit_in_gb: 10,
                    max_live_auctions: 3,
                    max_timed_auctions: 10,
                    timed_auction_duration: 3,
                    analytics_features: "Basic analytics",
                },
            };
        } catch (error) {
            this.logger.error(`Error while fetching auction details`, error.stack);
            return {
                success: false,
                status: 500,
                message: "Error occurred while validating auction details, please try again later.",
                data: null,
            };
        }
    }
}

