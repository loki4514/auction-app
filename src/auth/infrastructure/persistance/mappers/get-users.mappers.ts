import { accounts } from "@prisma/client";

export class GetUserMappers {
    toGetUserEntity(accounts: accounts) {
        return {
            user_id: accounts.account_id,
            email: accounts.email,
            password: accounts.password_hash,
            account_status: accounts.is_verified,
            user_role: accounts.user_role

        }

    }

    getUserEntity(accounts : accounts){
        return {
            user_id : accounts.account_id,
            email : accounts.email,
            account_status : accounts.is_verified,
            user_role : accounts.user_role
            
        }
    }

}

