import { Injectable } from "@nestjs/common";
import { IUserDetailsInterface } from "src/auth/domain/repository/get-user-detials.repository";
import { getUsersReponse } from "src/auth/domain/types/getUser.type";
import { UserJwtEntity } from "src/auth/domain/types/user-entity.type";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { GetUserMappers } from "../mappers/get-users.mappers";




@Injectable()
export class GetUserRepository extends IUserDetailsInterface{
    constructor(
        private readonly primsa : PrismaService,
        private readonly logger : ApplicationLogger,
        private readonly entityMapper : GetUserMappers

    ){
        super()
    }
    async getuserDetails(user_id: string): Promise<getUsersReponse<UserJwtEntity | null>> {

        try {
            const user_data = await this.primsa.accounts.findFirst({
                where: { account_id : user_id }
            })
            if (!user_data) {
                return { success: false, status: 404, message : `User authentication failed. Provided email address or user identifier is not registered.`, data: null }
            }
            const mapped_user_data = this.entityMapper.getUserEntity(user_data)

            return { success: true, status: 200, data: mapped_user_data, message : `user found` }


        } catch (error) {
            this.logger.error(`there was a problem running find user error by email in loginn repository ${error}`, error.stack)
            return { success: false, status: 500, data: null, message : 'There was a problem processing your request.'}

        }
        
    }

}