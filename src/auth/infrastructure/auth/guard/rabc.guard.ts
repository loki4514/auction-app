import {
    Injectable,
    ExecutionContext,
    CanActivate,
    UnauthorizedException,
    HttpException,
    ForbiddenException,
    SetMetadata
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { TokenService } from "src/shared/utils/token.service";
import { GetUserRepository } from "../../persistance/prisma/user-info.prisma.repository";
import { ICompanyRepository } from "src/users/domain/repository/company.repository";
import { AccountStatus, AccountType } from "@prisma/client";

@Injectable()
export class AuctionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly tokenService: TokenService,
        private readonly logger: ApplicationLogger,
        private readonly userService: GetUserRepository,
        private readonly companyService: ICompanyRepository
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest<Request>();

            // ✅ 1. Extract token from header
            const token = this.extractTokenFromHeader(request);
            if (!token) {
                throw new UnauthorizedException("Please provide a valid token");
            }

            // ✅ 2. Verify token
            const verify_token = this.tokenService.verifyJwtToken(token);
            if (!verify_token.flag || !verify_token.decoded) {
                throw new UnauthorizedException(verify_token.reason);
            }

            const decode_token = verify_token.decoded;

            // ✅ 3. Get user details
            const verify_user = await this.userService.getuserDetails(decode_token.user_id);
            if (!verify_user.success) {
                throw new HttpException(verify_user.message, verify_user.status);
            }

            const user = verify_user.data;
            if (!user) {
                throw new UnauthorizedException("User does not exist");
            }

            // ✅ 4. Ensure user is an auctioneer
            if (user.user_role === AccountType.bidder) {
                throw new ForbiddenException("You must be an auctioneer to create an auction");
            }

            // ✅ 5. Get company account details
            const account_response = await this.companyService.getCompanyById(user.account_id);
            const account_data = account_response?.data;

            if (account_response.status !== 200 || !account_data) {
                throw new ForbiddenException("Account not found. Please contact support.");
            }

            // ✅ 6. Check account status
            if (account_data.account_status === AccountStatus.pending) {
                throw new ForbiddenException(
                    "Your account is pending verification. Please complete the verification process."
                );
            }

            if (account_data.account_status !== AccountStatus.verified) {
                throw new ForbiddenException(
                    `Your account status is '${account_data.account_status}'. Please contact support to resolve this.`
                );
            }

            // ✅ 7. Check required roles (if route has role restrictions)
            const requiredRoles =
                this.reflector.get<string[]>("roles", context.getHandler()) || [];

            if (requiredRoles.length > 0 && !requiredRoles.includes(user.user_role)) {
                throw new ForbiddenException("You do not have permission to access this resource");
            }

            // ✅ 8. Attach data to request
            request["user_id"] = user.user_id;
            request["account_id"] = user.account_id;
            request["user_role"] = user.user_role;

            return true;

        } catch (error) {
            this.logger.error("AuctionGuard: Authorization failed", error.stack);
            throw new HttpException(
                {
                    success: false,
                    message: error.message || "Authorization failed",
                    error: error.name || "AuthenticationError",
                    status: error.status || 500,
                },
                error.status || 500
            );
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers["authorization"];
        if (!authHeader) return undefined;

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") return undefined;

        return parts[1];
    }
}

// ✅ Decorator for routes that need admin/auctioneer access
export const AdminOnly = () => SetMetadata("roles", ["admin", "auctioneer"]);
