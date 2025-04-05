import { PipeTransform, Injectable, HttpException, HttpStatus, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodSchema<any>) {}
    
    transform(value: any, metadata: ArgumentMetadata) {
        try {
            // For query parameters and body, we need to handle them differently
            if (metadata.type === 'query') {
                return value; // Allow query params to pass through
            }
            console.log(value,"thi sis isuva;")
            return this.schema.parse(value);
            
            
        } catch (error) {
            console.log(error,"this is error ")
            if (error instanceof ZodError) {
                // Format the error message
                console.log(error.errors,"thiis is the error ", error, error.errors[0])
                const firstError = error.errors[0]?.message || 'Validation failed';
                throw new HttpException(
                    {
                        success: false,
                        message: firstError,
                        status: HttpStatus.BAD_REQUEST,
                        error: firstError,
                    },
                    HttpStatus.BAD_REQUEST
                );
            }
            throw new BadRequestException('Invalid request data');
        }
    }
}