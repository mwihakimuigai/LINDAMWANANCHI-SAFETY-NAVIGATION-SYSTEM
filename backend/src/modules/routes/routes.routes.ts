import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { routesController } from "./routes.controller.js";
import { createRouteSchema, recommendationQuerySchema } from "./routes.schema.js";

const router = Router();

router.get("/", asyncHandler(routesController.list));
router.get("/recommend", validateQuery(recommendationQuerySchema), asyncHandler(routesController.recommend));
router.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  validateBody(createRouteSchema),
  asyncHandler(routesController.create)
);

export default router;
