import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from "@nestjs/common";
import Redis from "ioredis";
import { IGetAllAuctions } from "src/auctions/domain/repository/get-auctions.repostory";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import * as moment from 'moment-timezone';

@Injectable()
export class GetBidsUsecase {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
        private readonly auctionDetailsService: IGetAllAuctions,
        private readonly logger: ApplicationLogger,
    ) { }

    async getHighestBid(auction_id: string) {
        const redisKey = `auction:${auction_id}:bids`;

        const highestBid = await this.redisClient.zrevrange(redisKey, 0, 0, "WITHSCORES");

        if (!highestBid.length) {
            throw new HttpException({
                success: false,
                message: 'No bids found for this auction.',
            }, HttpStatus.BAD_REQUEST);
        }

        const [member, score] = highestBid;
        const [user_id, epoch] = member.split(":");
        const bidAmount = Number(score);
        const formattedTimestamp = moment.unix(Number(epoch)).format("YYYY-MM-DD HH:mm:ss");

        return {
            success: true,
            message: 'Highest bid fetched successfully.',
            data: {
                highest_bid_amount: bidAmount,
                timestamp: formattedTimestamp,
                user_id,
            }
        };
    }

    async getCurrentUserBid(auction_id: string, user_id: string) {
        const redisKey = `auction:${auction_id}:bids`;

        const allBids = await this.redisClient.hgetall(redisKey);

        const userBids = Object.entries(allBids)
            .filter(([field]) => field.startsWith(`${user_id}:`))
            .map(([field, value]) => {
                const [, epochStr] = field.split(":");
                return {
                    user_id,
                    timestampEpoch: Number(epochStr),
                    bid_amount: Number(value),
                };
            });

        if (!userBids.length) {
            throw new HttpException({
                success: false,
                message: 'User has not placed any bids.',
            }, HttpStatus.BAD_REQUEST);
        }

        // Get the latest bid by timestamp
        const latestBid = userBids.reduce((a, b) => (a.timestampEpoch > b.timestampEpoch ? a : b));

        return {
            success: true,
            message: 'Current user bid found.',
            data: {
                user_id: latestBid.user_id,
                bid_amount: latestBid.bid_amount,
                timestamp: moment.unix(latestBid.timestampEpoch).format("YYYY-MM-DD HH:mm:ss"),
            }
        };
    }


    async getAllbids(auction_id: string) {
        const redisKey = `auction:${auction_id}:bids`;

        const allBids = await this.redisClient.hgetall(redisKey);

        if (!Object.keys(allBids).length) {
            throw new HttpException({
                success: false,
                message: 'No bids found for this auction.',
            }, HttpStatus.BAD_REQUEST);
        }

        const bids = Object.entries(allBids).map(([field, value]) => {
            const [user_id, epochStr] = field.split(":");
            const bid_amount = Number(value);
            const timestamp = moment.unix(Number(epochStr)).format("YYYY-MM-DD HH:mm:ss");

            return {
                user_id,
                bid_amount,
                timestamp,
            };
        });

        return {
            success: true,
            message: 'All bids fetched successfully.',
            data: bids,
        };
    }
}
