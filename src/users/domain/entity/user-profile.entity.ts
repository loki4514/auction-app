export interface UserProfileEntity {
    account_id: string;
    phone_number: string | null;
    country_code: string | null;
    date_of_birth: Date | null;

    // Address Information
    street_address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zip_code: string | null;

    // Login Audit Logs
    failed_login_attempts: number;
    last_failed_login_ip: string | null;
    current_login_ip: string | null;
    previous_login_ip: string | null;
    last_password_reset_at: Date | null;
}
