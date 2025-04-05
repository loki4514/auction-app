import { Injectable, ExecutionContext, CanActivate, UnauthorizedException, HttpException, ForbiddenException, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { TokenService } from "src/shared/utils/token.service";
import { GetUserRepository } from "../../persistance/prisma/user-info.prisma.repository";

@Injectable()
export class AuctionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly tokenService: TokenService,
        private readonly logger: ApplicationLogger,
        private readonly userService: GetUserRepository
    ) {

    }


    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest<Request>();
            const token = this.extractTokenFromHeader(request)
            if (!token) {
                throw new UnauthorizedException("Please provide token or check your token")
            }

            const verify_token = this.tokenService.verifyJwtToken(
                token
            )
            if (!verify_token.flag) {
                throw new UnauthorizedException(verify_token.reason)
            }

            if (!verify_token.decoded) {
                throw new UnauthorizedException(verify_token.reason)
            }

            let decode_token = verify_token.decoded

            const verify_user = await this.userService.getuserDetails(decode_token.user_id)

            if (!verify_user.success) {
                throw new HttpException(verify_user.message, verify_user.status)
            }

            let user = verify_user.data

            if (!user) {
                throw new UnauthorizedException('User does not exist');
            }

            request['id'] = user.user_id

            const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
            if (!requiredRoles.includes(user.user_role)) {
                throw new ForbiddenException('You do not have permission to access this resource');
            }

            return true;


        } catch (error) {
            this.logger.error("Fail to verify the token please try again later", error.stack)
            console.log(error)
            throw new HttpException(
                {
                    success: false,
                    message: error.name || 'Authorization failed.',
                    error: error.message || 'AuthenticationError',
                    status: error.status || 500,
                },
                error.status || 500
            );
            return false
        }

    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers['authorization'];
    
        if (!authHeader) {
            return undefined; // No auth header at all
        }
    
        const parts = authHeader.split(' ');
    
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return undefined; // Invalid format
        }
    
        return parts[1]; // Extracted token
    }
    


}

export const AdminOnly = () => SetMetadata('roles', ['admin', 'auctioneer']);