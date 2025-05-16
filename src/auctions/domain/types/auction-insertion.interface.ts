export interface AuctionInsertionReponse {
    insertion_flag : boolean,
    message : string,
    status? : number,
    duplicate : boolean
}

export interface AuctionUpdateReponse {
    updation_flag : boolean,
    message : string,
    status? : number
}