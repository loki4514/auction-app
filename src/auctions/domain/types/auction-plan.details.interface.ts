export interface AuctionPlanDetails {
    max_auction_per_month: number;
    max_images_per_auction : number;
    max_hosts: number;
    max_bidders: number;
    max_videos_per_auctions: number;
    max_storage_limit_in_gb: number;
    max_live_auctions : number,
    max_timed_auctions : number,
    timed_auction_duration : number,
    analytics_features: string; // Only this is a string
}