import { users } from '@prisma/client'; // Prisma model
import { userVerificationStatus, verifyUserEntity } from 'src/users/domain/types/verify-user.types';



export class VerifyUserMapper {
    toEntity(prismaUser: users): verifyUserEntity {
        return {
            email : prismaUser.email,
            token: prismaUser.verification_token,
            expiresAt: prismaUser.verification_expires_at,
            
        }
    }

    accountStatus(primsaUser : users) : userVerificationStatus {
        return {
            email : primsaUser.email,
            full_name : `${primsaUser.first_name} ${primsaUser.last_name}`,
            is_verified : primsaUser.user_status
        }
    }
}
