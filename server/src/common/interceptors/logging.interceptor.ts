import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        // Generate or use existing request ID
        const requestId = (request.headers['x-request-id'] as string) || uuidv4();
        request.headers['x-request-id'] = requestId;
        response.setHeader('X-Request-ID', requestId);

        const { method, url, ip } = request;
        const userAgent = request.headers['user-agent'] || '';
        const userId = (request as unknown as { user?: { id: string } }).user?.id || 'anonymous';

        const startTime = Date.now();

        this.logger.log(
            `[${requestId}] → ${method} ${url} - User: ${userId} - IP: ${ip}`,
        );

        return next.handle().pipe(
            tap({
                next: () => {
                    const duration = Date.now() - startTime;
                    const { statusCode } = response;

                    this.logger.log(
                        `[${requestId}] ← ${method} ${url} - ${statusCode} - ${duration}ms`,
                    );
                },
                error: (error) => {
                    const duration = Date.now() - startTime;
                    const statusCode = error.status || 500;

                    this.logger.error(
                        `[${requestId}] ← ${method} ${url} - ${statusCode} - ${duration}ms - ${error.message}`,
                    );
                },
            }),
        );
    }
}
