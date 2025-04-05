import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export interface ApiResponseData<T> {
    success: boolean;
    message: string;
    status: number;
    data?: T;
    debug?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, T> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
        return next.handle().pipe(
            tap(res => console.log('Response: dummy this', res)), // Just logging, not modifying anything
            map(res => res) // Forward response as it is
        );
    }
}
