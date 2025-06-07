import {  EditAuctionImage } from "../entity/auction-image.entity";
import { AuctionImageDeletion, AuctionImageUpdation, GetAuctionImageId, NoOfAuctionImages } from "../types/auction-image.interface";


export abstract class IEditAuctionImage {
    abstract editAuctionImage(imageparams : EditAuctionImage) : Promise<AuctionImageUpdation>
}


export abstract class IDeleteAuctionImage {
    abstract deleteAuctionImage(image_id : string) : Promise<AuctionImageDeletion>
}

export abstract class IGetAuctionImageById {
    abstract getAuctionImageById(image_id : string, auction_id : string) : Promise<GetAuctionImageId>
}

export abstract class IGetNumberOfAuctionImage {
    abstract getNumberOfAuctionIMage(auction_id : string) : Promise<NoOfAuctionImages>
}