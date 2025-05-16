import {  EditAuctionImage } from "../entity/auction-image.entity";
import { AuctionImageDeletion, AuctionImageUpdation } from "../types/auction-image.interface";


export abstract class IEditAuctionImage {
    abstract editAuctionImage(imageparams : EditAuctionImage) : Promise<AuctionImageUpdation>
}


export abstract class IDeleteAuctionImage {
    abstract deleteAuctionImage(image_id : string) : Promise<AuctionImageDeletion>
}