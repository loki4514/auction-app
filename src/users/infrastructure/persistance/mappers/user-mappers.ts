import { users } from '@prisma/client';
import { UpdateUserDTO, UserEntity } from 'src/users/domain/entity/user.entiy';


export class UserMappers {
    static fromORM(prismaUser: users | null): UserEntity | null {
        if (!prismaUser) return null;

        return {
            user_id: prismaUser.user_id,
            account_id: prismaUser.account_id,
            email: prismaUser.email,
            password_hash: prismaUser.password_hash,
            user_role: prismaUser.user_role as 'bidder' | 'auctioneer' | 'admin',
            user_status: prismaUser.user_status as 'pending' | 'active' | 'verified' | 'inactive',
            verification_token: prismaUser.verification_token,
            verification_expires_at: prismaUser.verification_expires_at,
            last_login: prismaUser.last_login,
            first_name: prismaUser.first_name,
            last_name: prismaUser.last_name,
            profile_image_url: prismaUser.profile_image_url,
            phone_number: prismaUser.phone_number,
            date_of_birth: prismaUser.date_of_birth,
            created_at: prismaUser.created_at,
            updated_at: prismaUser.updated_at,
        };
    }

    static toORM(userEntity: UserEntity): Partial<users> {
        return {
            user_id: userEntity.user_id,
            account_id: userEntity.account_id,
            email: userEntity.email,
            password_hash: userEntity.password_hash,
            user_role: userEntity.user_role,
            user_status: userEntity.user_status,
            verification_token: userEntity.verification_token,
            verification_expires_at: userEntity.verification_expires_at,
            last_login: userEntity.last_login,
            first_name: userEntity.first_name,
            last_name: userEntity.last_name,
            profile_image_url: userEntity.profile_image_url,
            phone_number: userEntity.phone_number,
            date_of_birth: userEntity.date_of_birth,
        };
    }

    static toPartialORM(userEntity: Partial<UpdateUserDTO>): Partial<users> {
        const ormUser: Partial<users> = {};

        
        if (userEntity.password_hash) ormUser.password_hash = userEntity.password_hash;
        if (userEntity.user_role) ormUser.user_role = userEntity.user_role;
        if (userEntity.user_status) ormUser.user_status = userEntity.user_status;
        if (userEntity.last_login) ormUser.last_login = userEntity.last_login;
        if (userEntity.first_name) ormUser.first_name = userEntity.first_name;
        if (userEntity.last_name) ormUser.last_name = userEntity.last_name;
        if (userEntity.profile_image_url) ormUser.profile_image_url = userEntity.profile_image_url;
        if (userEntity.phone_number) ormUser.phone_number = userEntity.phone_number;
        if (userEntity.date_of_birth) ormUser.date_of_birth = userEntity.date_of_birth;

        return ormUser;
    }
}