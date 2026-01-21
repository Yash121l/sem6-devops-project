import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
    requestId?: string;
    details?: Record<string, unknown>;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const requestId = request.headers['x-request-id'] as string | undefined;

        let status: number;
        let message: string;
        let error: string;
        let details: Record<string, unknown> | undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = HttpStatus[status] || 'Error';
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as Record<string, unknown>;
                message = (responseObj.message as string) || exception.message;
                error = (responseObj.error as string) || HttpStatus[status] || 'Error';

                // Handle validation errors
                if (Array.isArray(responseObj.message)) {
                    message = 'Validation failed';
                    details = { errors: responseObj.message };
                }
            } else {
                message = exception.message;
                error = HttpStatus[status] || 'Error';
            }
        } else if (exception instanceof Error) {
            // Don't expose internal error details in production
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message =
                process.env.NODE_ENV === 'production'
                    ? 'Internal server error'
                    : exception.message;
            error = 'Internal Server Error';

            // Log the full error for debugging
            this.logger.error(
                `Unhandled exception: ${exception.message}`,
                exception.stack,
            );
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'Internal Server Error';
        }

        const errorResponse: ErrorResponse = {
            success: false,
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(requestId && { requestId }),
            ...(details && { details }),
        };

        // Log error details
        this.logger.warn(
            `${request.method} ${request.url} - ${status} - ${message}`,
            {
                requestId,
                ip: request.ip,
                userAgent: request.headers['user-agent'],
            },
        );

        response.status(status).json(errorResponse);
    }
}
