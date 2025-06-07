

export interface AuctionImageInsertion{
    auction_insert_status : boolean,
    message : string,
    status : number
}

export interface AuctionImageDeletion {
    auction_deleted_status : boolean,
    message : string,
    status : number
}

export interface AuctionImageUpdation {
    auction_updated_status : boolean,
    message : string,
    status : number
}

export interface GetAuctionImageId {
    auction_image_status : boolean,
    message : string,
    status : number,
    image_url? : string
}

export interface NoOfAuctionImages {
    auction_image_status : boolean,
    message : string,
    status : number,
    no_of_images? : number
}