export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code = "BAD_REQUEST", details?: unknown) {
    super(message, 400, code, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code = "NOT_FOUND", details?: unknown) {
    super(message, 404, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT", details?: unknown) {
    super(message, 409, code, details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, code = "UNPROCESSABLE_ENTITY", details?: unknown) {
    super(message, 422, code, details);
  }
}
