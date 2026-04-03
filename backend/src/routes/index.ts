import { Router } from "express";
import { pingDatabase } from "../config/db.js";
import authRoutes from "../modules/auth/auth.routes.js";
import usersRoutes from "../modules/users/users.routes.js";
import incidentsRoutes from "../modules/incidents/incidents.routes.js";
import alertsRoutes from "../modules/alerts/alerts.routes.js";
import routesRoutes from "../modules/routes/routes.routes.js";
import reportsRoutes from "../modules/reports/reports.routes.js";
import sosRoutes from "../modules/sos/sos.routes.js";
import mapRoutes from "../modules/map/map.routes.js";
import intelRoutes from "../modules/intel/intel.routes.js";
import pipelineRoutes from "../modules/pipeline/pipeline.routes.js";

const router = Router();

router.get("/health", async (_req, res) => {
  let db = "ok";
  try {
    await pingDatabase();
  } catch {
    db = "error";
  }

  res.status(db === "ok" ? 200 : 503).json({
    service: "lindamwananchi-backend",
    status: db === "ok" ? "ok" : "degraded",
    db,
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/incidents", incidentsRoutes);
router.use("/alerts", alertsRoutes);
router.use("/routes", routesRoutes);
router.use("/reports", reportsRoutes);
router.use("/sos", sosRoutes);
router.use("/map", mapRoutes);
router.use("/intel", intelRoutes);
router.use("/pipeline", pipelineRoutes);

export default router;
