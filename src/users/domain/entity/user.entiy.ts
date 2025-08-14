import { getISTDate } from "src/shared/utils/helper_function";

export interface UserEntity {
    user_id: string;
    account_id: string;
    email: string;
    password_hash: string;
    user_role: 'bidder' | 'auctioneer' | 'admin';
    user_status: 'pending' | 'active' | 'verified' | 'inactive';
    verification_token: string | null;
    verification_expires_at: Date | null;
    last_login: Date | null;
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
    phone_number?: string | null;
    date_of_birth?: Date | null;
    created_at: Date;
    updated_at: Date;
}


const current_date_time = getISTDate()
export interface UserDTO {
    account_id: string; // Optional since it's created in the use case
    email: string;
    password_hash?: string; // Raw password, optional for Google signup
    first_name: string;
    last_name: string;
    user_role?: 'bidder' | 'auctioneer' | 'admin';
    user_status: 'pending' | 'active' | 'verified' | 'inactive';
    phone_number?: string | null;
    date_of_birth?: Date | null; // Add Google auth code
    verification_token?: string | null;
    verification_expires_at?: Date | null;
    created_at: Date
    updated_at: Date
}
export interface UpdateUserDTO {
    first_name?: string;
    last_name?: string | null;
    profile_image_url?: string | null;
    password_hash?: string | null;
    phone_number?: string;
    date_of_birth?: Date | null;
    user_status?: 'pending' | 'active' | 'verified' | 'inactive';
    user_role?: 'bidder' | 'auctioneer' | 'admin';
    last_login?: Date | null;

}