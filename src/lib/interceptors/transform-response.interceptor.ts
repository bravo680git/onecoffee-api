import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response: T) => {
        const ctx = context.switchToHttp();
        const responseStatus = ctx.getResponse().statusCode;

        const meta = response?.['meta'];
        const message = response?.['message'] ?? '';

        return {
          data: meta ? response?.['data'] : response,
          meta,
          statusCode: responseStatus,
          message,
        };
      }),
    );
  }
}
