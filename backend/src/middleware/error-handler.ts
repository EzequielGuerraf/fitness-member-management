import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../lib/errors/app-error";

const buildErrorBody = (code: string, message: string, details?: unknown) => {
  return {
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details })
    }
  };
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json(
      buildErrorBody(
        "INVALID_REQUEST",
        "Request validation failed.",
        error.issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
          path: issue.path.join(".")
        }))
      )
    );
  }

  if (error instanceof AppError) {
    return response
      .status(error.statusCode)
      .json(buildErrorBody(error.code, error.message, error.details));
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return response
        .status(409)
        .json(buildErrorBody("UNIQUE_CONSTRAINT_VIOLATION", "A unique constraint was violated.", error.meta));
    }

    if (error.code === "P2025") {
      return response.status(404).json(buildErrorBody("RESOURCE_NOT_FOUND", "The requested resource was not found."));
    }
  }

  console.error(error);

  return response
    .status(500)
    .json(buildErrorBody("INTERNAL_SERVER_ERROR", "Unexpected internal server error."));
};
