import { accounts } from '@prisma/client'; // Prisma model
import { userVerificationStatus, verifyUserEntity } from 'src/users/domain/types/verify-user.types';



export class VerifyUserMapper {
    toEntity(prismaUser: accounts): verifyUserEntity {
        return {
            email : prismaUser.email,
            token: prismaUser.verification_token,
            expiresAt: prismaUser.verification_expires_at,
            
        }
    }

    accountStatus(primsaUser : accounts) : userVerificationStatus {
        return {
            email : primsaUser.email,
            full_name : `${primsaUser.first_name} ${primsaUser.last_name}`,
            is_verified : primsaUser.is_verified
        }
    }
}
