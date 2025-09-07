import { AccountStatus } from "@prisma/client";

AccountStatus
export interface AccountEntity {
    account_id: string;
    company_name?: string | null;
    created_at?: string | Date | null;
    current_plan_id?: string | null;
    is_used_free_plan?: boolean | null;
    account_type?: 'bidder' | 'auctioneer';
    account_status : AccountStatus;

    // Location & Contact
    email?: string | null;
    phone_number?: string | null;
    country?: string | null;
    country_code?: string | null;
    city?: string | null;
    state?: string | null;
    street_address?: string | null;
    zip_code?: string | null;
}


export interface UpdateAccountDTO {
    account_id: string; // required to identify which account to update

    company_name?: string | null;
    current_plan_id?: string | null;
    is_verified?: boolean;
    is_used_free_plan?: boolean;
    account_type?: 'bidder' | 'auctioneer';

    // Location & Contact
    email?: string | null;
    phone_number?: string | null;
    country?: string | null;
    country_code?: string | null;
    city?: string | null;
    state?: string | null;
    street_address?: string | null;
    zip_code?: string | null;
}
