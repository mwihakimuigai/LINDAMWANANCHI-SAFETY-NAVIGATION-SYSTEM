import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { intelController } from "./intel.controller.js";

const router = Router();

router.get("/", asyncHandler(intelController.list));
router.post("/sync", asyncHandler(intelController.sync));

export default router;
