import { PipeTransform, Injectable, HttpException, HttpStatus, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodSchema<any>) { }

    transform(value: any, metadata: ArgumentMetadata) {
        try {
            // Skip validation for query parameters and path parameters
            if (metadata.type === 'query' || metadata.type === 'param') {
                console.log(`Skipping validation for ${metadata.type}:`, value);
                return value;
            }

            console.log('=== DEBUG INFO ===');
            console.log('Value:', value);
            console.log('Value type:', typeof value);
            console.log('Metadata:', metadata);
            console.log('Is string?', typeof value === 'string');
            console.log('==================');

            return this.schema.parse(value);

        } catch (error) {
            console.log('=== ERROR DEBUG ===');
            console.log('Error:', error);
            console.log('Error type:', error.constructor.name);
            if (error instanceof ZodError) {
                console.log('Zod errors:', error.errors);
            }
            console.log('==================');

            if (error instanceof ZodError) {
                const firstError = error.errors[0]?.message || 'Validation failed';
                console.log("Validating correct error", firstError, typeof firstError);
                
                const errorResponse = {
                    success: false,
                    message: firstError,
                    statusCode: HttpStatus.BAD_REQUEST,
                    error: firstError,
                };

                console.log('Throwing error response:', JSON.stringify(errorResponse, null, 2));
                
                throw new BadRequestException(errorResponse);
            }
            throw new BadRequestException('Invalid request data');
        }
    }
}