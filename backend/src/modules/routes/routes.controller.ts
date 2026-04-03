import type { Request, Response } from "express";
import { routesService } from "./routes.service.js";

export const routesController = {
  async list(_req: Request, res: Response) {
    const routes = await routesService.listAll();
    res.status(200).json(routes);
  },

  async create(req: Request, res: Response) {
    const route = await routesService.create(req.body);
    res.status(201).json(route);
  },

  async recommend(req: Request, res: Response) {
    const destination = typeof req.query.destination === "string" ? req.query.destination : undefined;
    const endLat = typeof req.query.endLat === "string" ? Number(req.query.endLat) : undefined;
    const endLng = typeof req.query.endLng === "string" ? Number(req.query.endLng) : undefined;

    if (!destination?.trim() && (!Number.isFinite(endLat) || !Number.isFinite(endLng))) {
      res.status(400).json({ message: "Provide either destination or both endLat and endLng" });
      return;
    }

    const routes = await routesService.recommend({
      startLat: Number(req.query.startLat),
      startLng: Number(req.query.startLng),
      destination,
      endLat,
      endLng,
    });
    res.status(200).json(routes);
  },
};
