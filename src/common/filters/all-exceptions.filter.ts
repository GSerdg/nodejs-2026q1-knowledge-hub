import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '../errors/custom-error';
import { ThrottlerException } from '@nestjs/throttler';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let error = 'Internal Server Error';

    if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      message = exception.message;
      error = exception.name;
    } else if (exception instanceof ThrottlerException) {
      statusCode = HttpStatus.TOO_MANY_REQUESTS;
      message = 'Rate limit exceeded. Try again in a minute.';
      error = 'Too Many Requests';
      response.header('Retry-After', '60');
    } else if (
      exception.getStatus &&
      typeof exception.getStatus === 'function'
    ) {
      statusCode = exception.getStatus();

      const res = exception.getResponse();

      message = res.message || res;
      error = res.error || 'Exception';
    }

    this.logger.error(
      `${statusCode} [${error}]: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(statusCode).json({
      statusCode,
      error,
      message,
    });
  }
}
