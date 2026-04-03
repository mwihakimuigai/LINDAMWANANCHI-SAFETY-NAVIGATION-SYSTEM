import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { reportsController } from "./reports.controller.js";

const router = Router();

router.get("/dashboard", requireAuth, requireRole(["admin"]), asyncHandler(reportsController.dashboard));
router.get("/export", requireAuth, requireRole(["admin"]), asyncHandler(reportsController.exportReport));

export default router;
