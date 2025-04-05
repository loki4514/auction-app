export interface verifyUserReponse<T> {
    success: boolean,
    message: string,
    data?: T | null
}

export interface verifyUserEntity {
    email: string,
    token: string | null,
    expiresAt: Date | null
}

export interface userVerificationStatus {
    email: string,
    full_name : string,
    is_verified: boolean
}

export interface resendVerifyTokenResponse {
    success: boolean,
    message: string,
    status: number,
    data: userVerificationStatus | null
}