import { users } from "@prisma/client";

export class GetUserMappers {
    /**
     * Map user entity for login purpose (includes hashed password)
     */
    toGetUserEntity(user: users) {
        return {
            user_id: user.account_id,
            email: user.email,
            password: user.password_hash, // required for login validation
            account_status: user.user_status,
            user_role: user.user_role,
            full_name: `${user.first_name} ${user.last_name}`.trim(),
        };
    }

    /**
     * Map basic user details (e.g., for displaying account info after login)
     */
    toBasicUserEntity(user: users) {
        return {
            user_id: user.account_id,
            email: user.email,
            account_status: user.user_status,
            user_role: user.user_role,
            full_name: `${user.first_name} ${user.last_name}`.trim(),
        };
    }
}
