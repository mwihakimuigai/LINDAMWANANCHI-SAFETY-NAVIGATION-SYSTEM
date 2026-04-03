import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { mapController } from "./map.controller.js";

const router = Router();

router.get("/nairobi-layers", asyncHandler(mapController.nairobiLayers));

export default router;
