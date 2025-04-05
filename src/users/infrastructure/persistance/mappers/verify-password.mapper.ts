import { password_reset_tokens } from "@prisma/client";
import { verifyPasswordEntity } from "src/users/domain/types/password-reset.types";



export class VerifyPasswordMapper {

    toPasswordEntity(password_reset_tokens : password_reset_tokens) : verifyPasswordEntity {
        return {
            email : password_reset_tokens.email,
            token : password_reset_tokens.token,
            expiresAt : password_reset_tokens.expires_at

        }
    }

}