import type { Request, RequestHandler } from "express";
import type { ZodType } from "zod";

type RequestSchema = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export const validateRequest = (schema: RequestSchema): RequestHandler => {
  return (request, _response, next) => {
    try {
      if (schema.params) {
        request.params = schema.params.parse(request.params) as Request["params"];
      }

      if (schema.query) {
        request.query = schema.query.parse(request.query) as Request["query"];
      }

      if (schema.body) {
        request.body = schema.body.parse(request.body);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
