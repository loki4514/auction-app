export interface verifyPasswordEntity {
    email: string,
    token: string | null,
    expiresAt: Date | null
}

export interface passwordResetResponse {
    success : boolean,
    message : string,
    status : number,
    data : verifyPasswordEntity | null
}