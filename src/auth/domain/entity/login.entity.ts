export class LoginUserEntity {
    constructor(
        public readonly email: string,
        public readonly password: string
    ) {
    }
}