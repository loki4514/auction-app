
import { verifyUserEntity, verifyUserReponse } from "../types/verify-user.types";



export abstract class VerifyUserRepository {
    abstract findUserByToken(email: string, token: string): Promise<verifyUserReponse<verifyUserEntity>>;
    abstract toggleVerificationStatus(email : string) : Promise<verifyUserReponse<verifyUserEntity>>
}