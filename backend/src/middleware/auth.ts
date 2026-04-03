import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt.js";
import { HttpError } from "../utils/http.js";
import type { UserRole } from "../types/auth.js";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return next(new HttpError(401, "Authorization token is required"));
  }

  try {
    req.auth = verifyJwt(token);
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new HttpError(401, "Not authenticated"));
    }
    if (!roles.includes(req.auth.role)) {
      return next(new HttpError(403, "Insufficient permissions"));
    }
    return next();
  };
};
