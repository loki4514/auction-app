export interface CreateUserResponse<T> {
    success: boolean;
    message: string;
    status: number;
    debug?: T;
}