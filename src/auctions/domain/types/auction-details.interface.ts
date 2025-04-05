export interface getNoofAuction {
    success : boolean,
    status : number,
    no_of_hosted_auction : TotalNoOfAuction | null
}

export interface TotalNoOfAuction {
    live_auctions : number,
    timed_auctions : number,
    total_no_of_auctions : number,

}