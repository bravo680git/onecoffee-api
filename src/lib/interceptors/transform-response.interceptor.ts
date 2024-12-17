import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor<T extends ApiResponse>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response: T) => {
        const ctx = context.switchToHttp();
        const request: Request = ctx.getRequest();
        const responseStatus = ctx.getResponse().statusCode;

        const { page, limit } = request.query as RequestQuery;

        const meta = response?.meta;
        const defaultMessage = responseStatus < 400 ? 'Success' : 'Error';
        const message = response?.message ?? defaultMessage;

        return {
          data:
            meta && Number(page) && Number(limit) ? response?.data : response,
          meta,
          statusCode: responseStatus,
          message,
        };
      }),
    );
  }
}
