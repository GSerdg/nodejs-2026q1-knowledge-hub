import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query, body } = request;
    const now = Date.now();

    const sanitizedBody = this.sanitize(body);
    this.logger.log(
      `Request: ${method} ${url} | Query: ${JSON.stringify(query)} | Body: ${JSON.stringify(sanitizedBody)}`,
    );

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const responseTime = Date.now() - now;

        this.logger.log(
          `Response: ${method} ${url} | Status: ${response.statusCode} | Time: ${responseTime}ms`,
        );
      }),
    );
  }

  private sanitize(data: any): any {
    if (data === null || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const sensitiveKeys = new Set([
      'password',
      'newPassword',
      'oldPassword',
      'accessToken',
      'refreshToken',
    ]);
    const clone = {};

    for (const key in data) {
      if (sensitiveKeys.has(key)) {
        clone[key] = '[REDACTED]';
      } else {
        clone[key] = this.sanitize(data[key]);
      }
    }

    return clone;
  }
}
