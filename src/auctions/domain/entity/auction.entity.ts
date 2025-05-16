import { AuctionUpdateDetailsDto } from "src/auctions/interface/dtos/auction-update.dto";

export type ProductType = 
    | "electronics" 
    | "fashion" 
    | "automobiles" 
    | "real_estate" 
    | "art" 
    | "collectibles" 
    | "home_appliances" 
    | "sports" 
    | "others";

export type AuctionStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type CurrencyEnum = "INR" | "USD" | "EUR";

export type AuctionType = "live" | "timed"

export interface AuctionEntity {
    id: string;
    auction_name: string;
    auction_details?: string | null ;
    auction_product_type: ProductType;
    max_participants? : number | null;
    min_bid_amount : number;
    bid_increment: number;
    currency: CurrencyEnum;
    auction_status: AuctionStatus;
    auction_type : AuctionType,
    auction_start_time: Date;
    auction_end_time?: Date | null;
    auctioneer_id: string;
}


export interface AuctionUpdateEntity {
    auction_id : string,
    auctioneer_id : string,
    auction_params : AuctionUpdateDetailsDto
}