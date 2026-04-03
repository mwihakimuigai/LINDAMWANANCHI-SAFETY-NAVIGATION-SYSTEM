import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { usersController } from "./users.controller.js";
import { updateProfileSchema, updateRoleSchema } from "./users.schema.js";

const router = Router();

router.use(requireAuth);
router.get("/me", asyncHandler(usersController.me));
router.patch("/me", validateBody(updateProfileSchema), asyncHandler(usersController.updateMe));
router.get("/", requireRole(["admin"]), asyncHandler(usersController.list));
router.patch("/:id/role", requireRole(["admin"]), validateBody(updateRoleSchema), asyncHandler(usersController.updateRole));
router.delete("/:id", requireRole(["admin"]), asyncHandler(usersController.remove));

export default router;
