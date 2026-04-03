import { Router } from "express";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { sosController } from "./sos.controller.js";
import { setEmergencyContactSchema, triggerSosSchema } from "./sos.schema.js";

const router = Router();

router.get("/contact", asyncHandler(sosController.getContact));
router.post("/contact", validateBody(setEmergencyContactSchema), asyncHandler(sosController.setContact));
router.post("/trigger", validateBody(triggerSosSchema), asyncHandler(sosController.trigger));

export default router;
