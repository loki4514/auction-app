import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        console.log("this is status")
        const exceptionResponse = exception.getResponse();
        
        // Normalize response to object with proper typing
        const errorResponse = typeof exceptionResponse === 'string'
            ? { message: exceptionResponse }
            : (exceptionResponse as Record<string, any>);
        
        // Build final JSON response
        response.status(status).json({
            // Spread original response fields except statusCode/status
            ...errorResponse,
            // Add or override with consistent statusCode field (HTTP status code)
            statusCode: status,
            // Include success if it's missing (default false)
            success: errorResponse.success !== undefined ? errorResponse.success : false,
            timestamp: new Date().toISOString(),
            // path: request.url, // you can uncomment if needed
        });
    }
}
// Apply this filter globally in your main.ts:
// app.useGlobalFilters(new HttpExceptionFilter());