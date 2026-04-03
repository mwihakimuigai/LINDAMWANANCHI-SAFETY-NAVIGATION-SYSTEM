import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { incidentsController } from "./incidents.controller.js";
import { createIncidentSchema, listIncidentsQuerySchema, updateIncidentStatusSchema } from "./incidents.schema.js";

const router = Router();

router.get("/", validateQuery(listIncidentsQuerySchema), asyncHandler(incidentsController.list));
router.get("/:id", asyncHandler(incidentsController.getById));
router.post("/", requireAuth, validateBody(createIncidentSchema), asyncHandler(incidentsController.create));
router.patch(
  "/:id/verify",
  requireAuth,
  requireRole(["admin"]),
  asyncHandler(incidentsController.verify)
);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["admin"]),
  validateBody(updateIncidentStatusSchema),
  asyncHandler(incidentsController.updateStatus)
);

export default router;
