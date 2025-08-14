
import { UserDTO, UpdateUserDTO, UserEntity } from "../entity/user.entiy";

export abstract class IUserRepository {
    abstract findByEmail(email: string): Promise<{ data: UserEntity | null; debug?: string }>;
    abstract findByUserPhoneNumber(phone_number: string): Promise<{
        data: UserEntity | null;
    }>;
    abstract create(user: UserDTO): Promise<{  data: UserEntity | null; debug?: string }>;
    abstract updateUser(user_id : string, user : UpdateUserDTO)  : Promise<{status? : number, update_status : boolean}>
}
