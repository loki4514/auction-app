import { AuctionMetadataResponse, CreateAuctionMetadataDto, GetAuctionMetadataFilters, RepositoryResponse } from "../entity/auction-metadata.entity";


export abstract class IAuctionMetadataRepository {
    abstract createAuctionMetadata(data: CreateAuctionMetadataDto): Promise<RepositoryResponse<AuctionMetadataResponse | null>>;
    
    abstract getAuctionMetadataById(id: string): Promise<RepositoryResponse<AuctionMetadataResponse | null>>;
    
    abstract getAuctionMetadataByAuctionId(auction_id: string): Promise<RepositoryResponse<AuctionMetadataResponse[] | null>>;
    
    abstract getAllAuctionMetadata(filters?: GetAuctionMetadataFilters): Promise<RepositoryResponse<AuctionMetadataResponse[] | null>>;
    
    // abstract updateAuctionMetadata(id: string, data: Partial<CreateAuctionMetadataDto>): Promise<RepositoryResponse<AuctionMetadataResponse | null>>;
    
    // abstract deleteAuctionMetadata(id: string): Promise<RepositoryResponse<boolean>>;
    
    abstract getMetadataAnalytics(auction_id: string): Promise<RepositoryResponse<{
        total_views: number;
        unique_ips: number;
        device_breakdown: Record<string, number>;
        os_breakdown: Record<string, number>;
        location_breakdown: Record<string, number>;
    } | null>>;
}