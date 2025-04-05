export interface UserEntity {
    account_id: string;
    email: string;
    password_hash: string;
    created_at: Date;
    is_verified: boolean;
    user_role: 'bidder' | 'auctioneer' | 'admin';
    is_google_login: boolean;
    account_status: 'pending' | 'active' | 'suspended' | 'banned';
    verification_token: string | null;
    verification_expires_at: Date | null;
    last_login: Date | null;

    // Minimal Details Required At Signup
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
}
