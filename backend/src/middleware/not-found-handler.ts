import type { RequestHandler } from "express";
import { NotFoundError } from "../lib/errors/app-error";

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(
    new NotFoundError(
      `Route ${request.method} ${request.originalUrl} was not found.`,
      "ROUTE_NOT_FOUND"
    )
  );
};
