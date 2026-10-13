import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { isApiResponse } from './utils/api-response.js';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((body) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
        if (isApiResponse(body)) {
          return {
            statusCode,
            success: body.success,
            message: body.message,
            data: body.data,
          };
        }
        return {
          statusCode,
          success: true,
          message: 'Success',
          data: body ?? null,
        };
      }),
    );
  }
}
