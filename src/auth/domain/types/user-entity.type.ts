export interface UserEntity {
    user_id: string; // Or string, depending on your account_id type
    email: string;
    password: string; // Or whatever type your password_hash is
    account_status: boolean;
    user_role: string;
  }

export interface UserJwtEntity{
    user_id : string,
    email : string, 
    account_status : boolean,
    user_role : string

}