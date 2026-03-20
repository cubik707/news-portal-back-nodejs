import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../../../core/shared/exceptions/business.exception.js';

type ErrorPayload = { status: number; error: string; message: string };

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const payload = this.resolvePayload(exception);

    const meta = {
      url: `${request.method} ${request.url}`,
      status: payload.status,
      error: payload.error,
    };

    if (payload.status >= 500) {
      this.logger.error({ ...meta, err: exception }, payload.message);
    } else if (payload.status >= 400) {
      this.logger.warn(meta, payload.message);
    } else {
      this.logger.log(meta, payload.message);
    }

    response.status(payload.status).json({ ...payload, path: request.url });
  }

  private resolvePayload(exception: unknown): ErrorPayload {
    if (exception instanceof BusinessException) {
      return { status: exception.statusCode, error: exception.name, message: exception.message };
    }
    if (exception instanceof HttpException) {
      return this.resolveHttpPayload(exception);
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message: exception instanceof Error ? exception.message : 'Internal server error',
    };
  }

  private resolveHttpPayload(exception: HttpException): ErrorPayload {
    const status = exception.getStatus();
    const res = exception.getResponse();

    if (typeof res === 'string') {
      return { status, error: exception.name, message: res };
    }

    if (typeof res === 'object' && res !== null) {
      const resObj = res as Record<string, unknown>;
      const rawMessage = resObj['message'];
      const message = Array.isArray(rawMessage)
        ? (rawMessage as string[]).join(', ')
        : typeof rawMessage === 'string'
          ? rawMessage
          : exception.message;
      const rawError = resObj['error'];
      const error = typeof rawError === 'string' ? rawError : exception.name;
      return { status, error, message };
    }

    return { status, error: exception.name, message: exception.message };
  }
}
