import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { alertsController } from "./alerts.controller.js";
import { createAlertSchema, listAlertsQuerySchema } from "./alerts.schema.js";

const router = Router();

router.get("/", validateQuery(listAlertsQuerySchema), asyncHandler(alertsController.list));
router.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  validateBody(createAlertSchema),
  asyncHandler(alertsController.create)
);
router.patch("/:id/toggle", requireAuth, requireRole(["admin"]), asyncHandler(alertsController.toggle));

export default router;
