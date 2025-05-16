import { AuctionStatus, AuctionType, CurrencyEnum, ProductType } from "../entity/auction.entity";

interface IAuction {
    auction_id: string;
    auction_name: string;
    auction_product_type: ProductType;
    auction_details: string | null; // Make it nullable since auction_details can be null
    max_participants: number | null; // Optional fields could be nullable
    min_next_bid_increment: number;
    initial_bid_amount: number;
    currency: CurrencyEnum;
    auction_start_time: Date; // Assuming you're using string format (ISO8601)
    auction_end_time: Date | null; // Nullable, depending on the auction type
    status: AuctionStatus;
    auction_type : AuctionType;
    created_at: Date;
    images : IAuctionImage[];

}

interface IAuctionImage {
    image_id: string;
    image_url: string;
}

interface IPageination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

// Combine the auction and image details into a unified type.
type AuctionWithImages = IAuction ;


export interface IGetAllAuction {
    success: boolean,
    status: number,
    data: AuctionWithImages[] | []
    pagination : IPageination | null
}

export interface IAllAuctionResponse{
    success: boolean,
    status: number,
    data?: AuctionWithImages[] | []
    message : string,
    pagination? : IPageination | null
}

// a."auction_id",
// a."auction_name",
// a."auction_product_type",
// a."auction_details",
// a."max_participants",
// a."min_next_bid_increment",
// a."initial_bid_amount",
// a."currency",
// a."auction_start_time",
// a."auction_end_time",
// a."status",
// b."image_id",
// b."image_url"