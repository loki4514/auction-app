export interface UserProfileEntity {
    account_id: string;
    user_id: string;
    phone_number: string | null;
    date_of_birth: Date | null;

    // Address Informat

    // Login Audit Logs
    failed_login_attempts: number;
    last_failed_login_ip: string | null;
    current_login_ip: string | null;
    previous_login_ip: string | null;
    last_password_reset_at: Date | null;
}


export interface CreateUserDTO {
    account_id: string;         // required to associate user with an account
    email: string;
    password_hash: string;
    first_name: string;
    last_name?: string;
    user_role?: 'bidder' | 'auctioneer' | 'admin';  // optional override
    is_verified: boolean
}
