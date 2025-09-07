export interface UserEntity {
    user_id: string; // Or string, depending on your account_id type
    email: string;
    password: string; // Or whatever type your password_hash is
    account_status: string;
    account_id : string;
    user_role: string;
    full_name : string;
}

export interface LoginUserJwtEntity{
    user_id : string
    email : string
    account_status : string
    user_role : string
    full_name : string
    account_id : string
    session_id : string

}

export interface UserJwtEntity{
    user_id : string
    email : string
    account_status : string
    user_role : string
    full_name : string

}