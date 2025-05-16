// src/infrastructure/utils/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

@Injectable()
export class ApplicationLogger implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info', // Set log level: 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
                }),
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(), // Add colors
                        nestWinstonModuleUtilities.format.nestLike(),
                    ),
                }),
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Store errors in a file
                new winston.transports.File({ filename: 'logs/combined.log' }), // Store all logs
            ],
        });
    }

    log(message: string) {
        this.logger.info(message);
    }

    error(message: string, trace?: string) {
        this.logger.error(`${message} - ${trace || ''}`);
    }

    warn(message: string, trace?: string) {
        this.logger.warn(`${message} - ${trace || ''}`);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    verbose(message: string) {
        this.logger.verbose(message);
    }
}
