import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../../../core/shared/exceptions/business.exception.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let error: string;
    let message: string;

    if (exception instanceof BusinessException) {
      status = exception.statusCode;
      error = exception.name;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = Array.isArray(resObj['message'])
          ? (resObj['message'] as string[]).join(', ')
          : String(resObj['message'] ?? exception.message);
        error = String(resObj['error'] ?? exception.name);
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'InternalServerError';
      message =
        exception instanceof Error ? exception.message : 'Internal server error';
    }

    response.status(status).json({
      error,
      message,
      status,
      path: request.url,
    });
  }
}
