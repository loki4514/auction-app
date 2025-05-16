
import { AuctionUpdateEntity } from "../entity/auction.entity";
import { AuctionInsertionReponse, AuctionUpdateReponse } from "../types/auction-insertion.interface";


export abstract class IEditAuction {
    abstract updateAuctionDetails (updateParams : AuctionUpdateEntity) : Promise<AuctionUpdateReponse>
}