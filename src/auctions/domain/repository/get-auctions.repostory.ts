import { IGetAllAuction, IGetAuction } from "../types/get-all-auction.interface";


export abstract class IGetAllAuctions {
    abstract getAllAuctions(page: number, limit: number) : Promise<IGetAllAuction>
    abstract getAuctionById(auction_id : string) : Promise<IGetAuction>
}