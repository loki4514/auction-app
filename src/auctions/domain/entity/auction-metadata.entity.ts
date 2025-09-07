// Types/Interfaces
export interface CreateAuctionMetadataDto {
    auction_id: string;
    ip_address?: string;
    user_agent?: string;
    device?: string;
    os?: string;
    location?: clientLocation;
}

export interface AuctionMetadataResponse {
    id: string;
    auction_id: string;
    ip_address?: string | null;
    user_agent?: string | null;
    device?: string | null;
    os?: string | null;
    location?: any; // JSON type - can be clientLocation or any other JSON structure
    created_at: Date;
    auction?: {
        auction_id: string;
        auction_name: string;
    };
}

export interface GetAuctionMetadataFilters {
    auction_id?: string;
    ip_address?: string;
    device?: string;
    os?: string;
    created_from?: Date;
    created_to?: Date;
}

export interface clientLocation {
    status: string;
    country: string;
    regionName: string;
    city: string;
    query: string;
}

// Simplified response type with only status and data
export interface RepositoryResponse<T> {
    status: number;
    data: T;
}