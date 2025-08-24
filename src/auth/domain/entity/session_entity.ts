export interface SessionData {
    user_id: string;
    user_role: string;
    account_type: string;
    ip_address: string;
    browser_info: string;
    created_at: number;      // timestamp
    last_activity: number;   // timestamp
    status: 'active' | 'inactive';
    location: {
        status: string;
        country: string;
        regionName: string;
        city: string;
        query: string;
    } | null;
}

export interface ActiveSession extends SessionData {
    sessionId: string;
}

