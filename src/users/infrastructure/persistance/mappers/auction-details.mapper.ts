import { plan } from "@prisma/client";

export class AuctionDetailsMapper {
    auctionDetailsOrm(plan_details : plan){
        return {
            max_auction_per_month : plan_details.auctions_per_month,
            max_image : plan_details.max_images,
            max_hosts : plan_details.max_hosts,
            max_bidders : plan_details.max_bidders,
            max_videos : plan_details.max_videos,
            max_images : plan_details.max_images,
            max_storage_limit_in_gb : plan_details.storage_limit_gb,
            analytics_features : plan_details.extra_features,
        }

    }
}