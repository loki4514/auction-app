import { UserEntity } from "../entity/user.entiy";






export abstract class UserRepository {
    abstract findByEmail(email: string): Promise<{ success: boolean; message?: string; status?: number; data?: UserEntity; debug?: string }>;
    abstract create(user: UserEntity): Promise<{ success: boolean; message?: string; status?: number; data?: UserEntity; debug?: string }>;
}
