export interface MailPayload {
    to: string,
    subject: string,
    body: string,
    html?: string// ✅ Fallback to text if HTML is missing
}


export interface MailFuncResponse {
    status: boolean;
    message: string;
    error?: string;
}

