import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { pipelineController } from "./pipeline.controller.js";

const router = Router();

router.get("/status", pipelineController.status);
router.post("/trigger", asyncHandler(pipelineController.trigger));

export default router;
