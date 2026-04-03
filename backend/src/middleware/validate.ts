import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";
import { HttpError } from "../utils/http.js";

export const validateBody = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new HttpError(400, "Validation failed", result.error.flatten()));
    }
    (req as Request & { body: unknown }).body = result.data;
    return next();
  };
};

export const validateQuery = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new HttpError(400, "Invalid query parameters", result.error.flatten()));
    }
    (req as unknown as { query: unknown }).query = result.data;
    return next();
  };
};
