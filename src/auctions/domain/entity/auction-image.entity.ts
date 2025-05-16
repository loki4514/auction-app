export interface AuctionImage{
    auction_id : string,
    image_url : string[],
}

export interface EditAuctionImage{
    auction_id : string,
    image_url : string,
    image_id : string,
}

export interface UploadAuctionEntity {
    auction_id : string,
    image_url : string,
    updated_at : Date
}