

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