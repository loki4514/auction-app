export interface RequestMetaDta {
    ip: string;
    userAgent: string;
    location: {
        status: string;
        country: string;
        regionName: string;
        city: string;
        query: string;
    } | null;
}
