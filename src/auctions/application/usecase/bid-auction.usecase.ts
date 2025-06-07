import { BadRequestException, ConflictException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { IGetAllAuctions } from "src/auctions/domain/repository/get-auctions.repostory";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";

@Injectable()
export class BidAuctionUsecase {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
        private readonly auctionDetailsService: IGetAllAuctions,
        private readonly logger: ApplicationLogger,
    ) { }

    verifyBidAmount(initial_bid_increment: number, incoming_bid_increment: number): boolean {
        return incoming_bid_increment > initial_bid_increment;
    }

    async bidAuction(bidParams: { auction_id: string, user_id: string, amount: number }) {
        const { auction_id, user_id, amount } = bidParams
        console.log(bidParams, "this aree the bid params")
        const redisKey = `auction:${auction_id}:bids`;

        try {
            this.logger.log(`[Bid Attempt] User: ${user_id}, Auction: ${auction_id}, Amount: ${amount}`);

            const auction_details = await this.auctionDetailsService.getAuctionById(auction_id);
            if (!auction_details.success || !auction_details.data) {
                this.logger.error(`[Auction Fetch Fail] Auction ID: ${auction_id} | ${auction_details.message}`);
                throw new HttpException({
                    success: false,
                    message: auction_details.message || "Auction details not found",
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const { initial_bid_amount, min_next_bid_increment, currency } = auction_details.data;

            if (!this.verifyBidAmount(initial_bid_amount, amount)) {
                this.logger.warn(`[Invalid Bid Amount] User: ${user_id}, Amount: ${amount}, Min Required: ${min_next_bid_increment}`);
                throw new HttpException({
                    success: false,
                    message: `Bid must be greater than the current minimum increment: ${min_next_bid_increment} ${currency}`,
                }, HttpStatus.BAD_REQUEST);
            }

            const highestBid = await this.redisClient.zrevrange(redisKey, 0, 0, "WITHSCORES");
            const highestScore = highestBid.length ? Number(highestBid[1]) : 0;
            const highestUser = highestBid.length ? highestBid[0].split(":")[0] : null;

            if (highestUser === user_id) {
                this.logger.warn(`[Duplicate Highest Bidder] User: ${user_id} already has highest bid`);
                throw new HttpException({
                    success: false,
                    message: "You are already the highest bidder",
                }, HttpStatus.FORBIDDEN);
            }

            const existingBids = await this.redisClient.zrangebyscore(redisKey, amount, amount);
            const hasUserAlreadyBid = existingBids.some((entry) => entry.startsWith(user_id + ":"));
            if (hasUserAlreadyBid) {
                this.logger.warn(`[Duplicate Bid] User: ${user_id} already bid ${amount} ${currency}`);
                throw new ConflictException(
                    {
                        success: false,
                        message: `You've already placed a bid of ${amount} ${currency}`,
                    }
                );
            }



            if (amount > highestScore) {


                // Check if bid increment is too small
                const minimumRequiredBid = highestScore + initial_bid_amount;
                if (amount < minimumRequiredBid) {
                    throw new BadRequestException({
                        success: false,
                        message: `Bid rejected. Minimum bid must be ${minimumRequiredBid.toFixed(2)} ${currency} (current highest: ${highestScore.toFixed(2)} ${currency} + increment: ${initial_bid_amount.toFixed(2)} ${currency})`,
                        currentHighestBid: highestScore,
                        minimumIncrement: initial_bid_amount,
                        minimumRequiredBid,
                        currency
                    });
                }

                const bidId = `${user_id}:${Date.now()}`;
                await this.redisClient.zadd(redisKey, amount, bidId);

                this.logger.log(`[Bid Accepted] User: ${user_id}, Amount: ${amount}, Score: ${highestScore}`);
                return {
                    success: true,
                    message: `✅ Bid of $${amount} by user ${user_id} accepted`,
                };
            } else {
                this.logger.warn(`[Bid Too Low] User: ${user_id}, Amount: ${amount}, Current Highest: ${highestScore}`);
                throw new HttpException({
                    success: false,
                    message: `Bid rejected. Current highest is $${highestScore}`,
                }, HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            this.logger.error(`[Bid Error] Auction: ${auction_id}, User: ${user_id}, Error: ${error.message}`);
            throw error;
        }
    }
}
