export class AsertuOptimizerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AsertuOptimizerError";
  }
}

export class TransportError extends AsertuOptimizerError {
  constructor(message: string) {
    super(message);
    this.name = "TransportError";
  }
}

export class ApiError extends AsertuOptimizerError {
  readonly statusCode: number;
  readonly responseBody: unknown;

  constructor(
    message: string,
    statusCode: number,
    responseBody?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.responseBody = responseBody ?? null;
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "BadRequestError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "AuthenticationError";
  }
}

export class PermissionDeniedError extends ApiError {
  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "PermissionDeniedError";
  }
}

export class ValidationError extends AsertuOptimizerError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class MissingCredentialsError extends ValidationError {
  constructor(message: string) {
    super(message);
    this.name = "MissingCredentialsError";
  }
}
