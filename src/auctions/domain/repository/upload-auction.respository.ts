import { AuctionInsertionReponse } from "../types/auction-insertion.interface";
import { AuctionEntity } from "../entity/auction.entity";


export abstract class IUploadAuction{
    abstract createAuction(auctionParams : AuctionEntity) : Promise<AuctionInsertionReponse>
}