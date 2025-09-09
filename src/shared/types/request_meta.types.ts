export interface RequestMetaData {
    ip: string;
    userAgent: string;
    device? : string | null,
    os? : string | null,
    location: {
        status: string;
        country: string;
        regionName: string;
        city: string;
        query: string;
    } | null;
}
