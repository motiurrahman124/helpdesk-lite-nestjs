import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
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

  private getErrorPayload(exception: unknown) {
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

    const body = exceptionResponse as { message?: string | string[]; error?: string };
    return {
      message: body.error ?? exception.name.replace(/Exception$/, ''),
      errorMessage: body.message ?? exception.message,
    };
  }
}
