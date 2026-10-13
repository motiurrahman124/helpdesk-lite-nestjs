var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
import { Catch, HttpException, HttpStatus, Logger, } from '@nestjs/common';
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        if (!(exception instanceof HttpException)) {
            this.logger.error(exception instanceof Error ? exception.stack : exception);
        }
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const { message, errorMessage } = this.getErrorPayload(exception);
        response.status(status).json({
            statusCode: status,
            success: false,
            message,
            errorMessage,
        });
    }
    getErrorPayload(exception) {
        if (!(exception instanceof HttpException)) {
            return {
                message: 'Internal Server Error',
                errorMessage: 'Internal server error',
            };
        }
        const exceptionResponse = exception.getResponse();
        if (typeof exceptionResponse === 'string') {
            return {
                message: exception.name.replace(/Exception$/, ''),
                errorMessage: exceptionResponse,
            };
        }
        const body = exceptionResponse;
        return {
            message: body.error ?? exception.name.replace(/Exception$/, ''),
            errorMessage: body.message ?? exception.message,
        };
    }
};
HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    Catch()
], HttpExceptionFilter);
export { HttpExceptionFilter };
//# sourceMappingURL=http-exception.filter.js.map