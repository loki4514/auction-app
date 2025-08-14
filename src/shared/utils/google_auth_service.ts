// auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
    async verifyGoogleToken(token: string, expectedEmail: string) {
        try {
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const userInfo = response.data;

            if (!userInfo.email) {
                throw new UnauthorizedException('Email not found in Google profile');
            }

            // Compare emails
            if (userInfo.email.toLowerCase() !== expectedEmail.toLowerCase()) {
                throw new UnauthorizedException('Google email does not match provided email');
            }

            return {
                success: true,
                user: {
                    email: userInfo.email,
                    firstName: userInfo.given_name,
                    lastName: userInfo.family_name,
                    picture: userInfo.picture,
                },
            };
        } catch (error) {
            const message =
                error?.response?.data?.error_description ||
                error?.response?.data?.error ||
                error.message ||
                'Invalid or expired Google token';

            console.error('Failed to verify Google token:', message);
            throw new UnauthorizedException(message);
        }
    }
}
