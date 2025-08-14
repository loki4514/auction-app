import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

@Injectable()
export class ApplicationLogger implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
                }),
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        nestWinstonModuleUtilities.format.nestLike('AppLogger', {
                            prettyPrint: true,
                        }),
                    ),
                }),
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
            ],
        });
    }

    log(...args: any[]) {
        this.logger.info(this.formatArgs(args));
    }

    error(...args: any[]) {
        this.logger.error(this.formatArgs(args));
    }

    warn(...args: any[]) {
        this.logger.warn(this.formatArgs(args));
    }

    debug(...args: any[]) {
        this.logger.debug(this.formatArgs(args));
    }

    verbose(...args: any[]) {
        this.logger.verbose(this.formatArgs(args));
    }

    private formatArgs(args: any[]): string {
        return args
            .map(arg => {
                if (arg instanceof Error) {
                    return `${arg.message}\n${arg.stack}`;
                } else if (typeof arg === 'object') {
                    return JSON.stringify(arg, null, 2);
                }
                return String(arg);
            })
            .join(' | ');
    }
}
