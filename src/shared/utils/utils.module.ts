import { Module } from '@nestjs/common';
import { ApplicationLogger } from '../infrastructure/logger/application.logger';
import { TransporterService } from '../infrastructure/mailServices/mail.service';
import { TokenService } from './token.service';
import { PasswordHasher } from './password.hasher';
import { AuthService } from './google_auth_service';
import { getISTDate } from './helper_function';

/**
 * UtilsModule
 * 
 * This module centralizes utility services that are commonly needed across the application.
 * It groups non-domain-specific helpers (logging, token handling, password hashing, etc.)
 * into a single reusable module that can be imported wherever needed.
 * 
 * Providers included:
 * 
 * 1. ApplicationLogger  → Centralized application logger with consistent formatting
 * 2. TransporterService → Email sending service (e.g., SMTP / Nodemailer wrapper)
 * 3. TokenService       → Token generation & validation (e.g., JWT, verification tokens)
 * 4. PasswordHasher     → Password hashing & verification logic (e.g., bcrypt)
 * 5. AuthService        → Google OAuth authentication service
 * 
 * Exports:
 * All providers are exported so they can be injected into any other module in the app.
 */
@Module({
    providers: [
        ApplicationLogger,  // Logging utility for structured and consistent logs
        TransporterService, // Handles sending emails (transactional, verification, etc.)
        TokenService,       // Generates and validates tokens (JWT, verification)
        PasswordHasher,     // Provides secure password hashing & comparison
        AuthService,
                // Handles Google OAuth authentication flow
    ],
    exports: [
        ApplicationLogger,
        TransporterService,
        TokenService,
        PasswordHasher,
        AuthService
    ],
})
export class UtilsModule {}
