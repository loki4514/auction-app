

export abstract class IGetHostedAuctions{
    abstract getauctionByAuctionId(auction_id : string) : Promise<boolean>
}