import { getUsersReponse } from "../types/getUser.type";
import { UserJwtEntity } from "../types/user-entity.type";


export abstract class IUserDetailsInterface{
    abstract getuserDetails(user_id : string):Promise<getUsersReponse<UserJwtEntity | null>>
}