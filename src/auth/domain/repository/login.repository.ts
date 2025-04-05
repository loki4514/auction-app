import { getUsersReponse } from "../types/getUser.type";
import { UserEntity } from "../types/user-entity.type";


export abstract class LoginRepository {
    abstract getUser(email : string) : Promise<getUsersReponse<UserEntity | null>>
}