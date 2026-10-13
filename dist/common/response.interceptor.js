var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, } from '@nestjs/common';
import { map } from 'rxjs';
import { isApiResponse } from './utils/api-response.js';
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe(map((body) => {
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
        }));
    }
};
ResponseInterceptor = __decorate([
    Injectable()
], ResponseInterceptor);
export { ResponseInterceptor };
//# sourceMappingURL=response.interceptor.js.map