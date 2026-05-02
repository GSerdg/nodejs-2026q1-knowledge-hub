import { HttpStatus } from '@nestjs/common';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: any, statusCode: number) {
    super(Array.isArray(message) ? message.join(', ') : message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ValidationError extends AppError {
  constructor(message: any = 'Validation failed') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity') {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
