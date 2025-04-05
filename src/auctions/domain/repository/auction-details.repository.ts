import { getUsersReponse } from "src/auth/domain/types/getUser.type";
import { getNoofAuction } from "../types/auction-details.interface";
import { getDetails } from "src/shared/types/prisma.types";
import { AuctionPlanDetails } from "../types/auction-plan.details.interface";


export abstract class IGetAuctionDetails {
    abstract findUniqueAuctionId(auction_id : string) :  Promise<boolean>
    abstract getNoofAuction(user_id  : string) : Promise<getNoofAuction> 
    abstract getAuctionDetails(user_id : string) : Promise<getDetails<AuctionPlanDetails | null>>
}