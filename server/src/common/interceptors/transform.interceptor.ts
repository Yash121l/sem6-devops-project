import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
    success: true;
    statusCode: number;
    message: string;
    data: T;
    meta?: ResponseMeta;
    timestamp: string;
}

export interface ResponseMeta {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
}

export const RESPONSE_MESSAGE_KEY = 'response_message';
export const SKIP_TRANSFORM_KEY = 'skip_transform';

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, SuccessResponse<T>> {
    constructor(private readonly reflector: Reflector) { }

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<SuccessResponse<T>> {
        const skipTransform = this.reflector.getAllAndOverride<boolean>(
            SKIP_TRANSFORM_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (skipTransform) {
            return next.handle();
        }

        const message =
            this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]) || 'Success';

        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        return next.handle().pipe(
            map((data) => {
                // Handle paginated responses
                if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
                    return {
                        success: true,
                        statusCode,
                        message,
                        data: data.items,
                        meta: data.meta,
                        timestamp: new Date().toISOString(),
                    };
                }

                return {
                    success: true,
                    statusCode,
                    message,
                    data,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }
}
