import { Catch, HttpException, ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        let errorMessage = "Something went wrong";
        let errorType = "Error occurred";

        // Ensure exceptionResponse is an object before accessing properties
        if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
            errorMessage = exceptionResponse["message"] || errorMessage;
            errorType = exceptionResponse["error"] || errorType;
        } else if (typeof exceptionResponse === "string") {
            errorMessage = exceptionResponse; // Sometimes it's just a string
        }

        console.log("HttpException caught:", {
            status,
            errorType,
            errorMessage
        });

        const formattedResponse = {
            success: false,
            message: errorMessage, // Detailed error message
            status: status,
            error: errorType // Error type like "Bad Request"
        };

        response.status(status).json(formattedResponse);
    }
}
