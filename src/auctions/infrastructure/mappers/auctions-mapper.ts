import { auction, product_type } from "@prisma/client"; // Prisma's enum
import { AuctionEntity, ProductType } from "src/auctions/domain/entity/auction.entity";

// Convert ProductType (TS Enum) to product_type (Prisma Enum)
function mapProductTypeToPrisma(type: ProductType): product_type {
    return type as unknown as product_type;
}

// Convert product_type (Prisma Enum) to ProductType (TS Enum)
function mapProductTypeFromPrisma(type: product_type): ProductType {
    return type as unknown as ProductType;
}

export class AuctionMappers {
    ToORM(toOrmEntity: AuctionEntity): auction {
        return {
            auction_id: toOrmEntity.id,
            auction_name: toOrmEntity.auction_name,
            auction_details: toOrmEntity.auction_details!,
            auction_product_type: mapProductTypeToPrisma(toOrmEntity.auction_product_type), // Safe conversion
            max_participants: toOrmEntity.max_participants!,
            auction_type : toOrmEntity.auction_type,
            min_next_bid_increment: toOrmEntity.bid_increment,
            initial_bid_amount: toOrmEntity.min_bid_amount,
            currency: toOrmEntity.currency,
            status : toOrmEntity.auction_status,
            auction_start_time: toOrmEntity.auction_start_time,
            auction_end_time: toOrmEntity.auction_end_time!,
            auctioneer_id: toOrmEntity.auctioneer_id,
            rejection_status : false,
            rejection_reason : null,
            created_at: new Date(), // Defaulting to now()
            updated_at: new Date(), // Defaulting to now()
        };
    }

    FromORM(fromOrmEntity: auction): AuctionEntity {
        return {
            id: fromOrmEntity.auction_id,
            auction_name: fromOrmEntity.auction_name,
            auction_details: fromOrmEntity.auction_details!, // Handle nullable fields
            auction_product_type: mapProductTypeFromPrisma(fromOrmEntity.auction_product_type), // Safe conversion
            max_participants: fromOrmEntity.max_participants!,
            bid_increment: fromOrmEntity.min_next_bid_increment,
            min_bid_amount : fromOrmEntity.initial_bid_amount,
            currency: fromOrmEntity.currency,
            auction_status: fromOrmEntity.status,
            auction_start_time: fromOrmEntity.auction_start_time,
            auction_end_time: fromOrmEntity.auction_end_time!,
            auction_type : fromOrmEntity.auction_type,
            auctioneer_id: fromOrmEntity.auctioneer_id, // You may need to fetch the auctioneer name separately
        };
    }
}
