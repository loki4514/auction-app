
import { AuctionImage } from "../entity/auction-image.entity";
import { AuctionImageInsertion } from "../types/auction-image.interface";


export abstract class IUploadAuctionImage {
    abstract uploadAuctionImage(imageparams : AuctionImage) : Promise<AuctionImageInsertion>
}