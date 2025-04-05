export interface PasswordResetEntity {
    token: string;                      // Random 20-char token
    email: string;                      // User's email address
    expires_at: Date;                   // Expiry date/time
               // Timestamp when it was last updated
}
