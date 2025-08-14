export interface VerificationEmailJob {
    email: string;
    verificationToken: string;
    fullName: string;
}

export interface EmailJobData {
    type: 'verification' | 'password-reset' | 'welcome';
    data: VerificationEmailJob | any; // Add other email types as needed
}