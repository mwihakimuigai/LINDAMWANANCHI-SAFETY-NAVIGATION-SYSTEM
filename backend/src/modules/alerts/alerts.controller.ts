import type { Request, Response } from "express";
import { alertsService } from "./alerts.service.js";

export const alertsController = {
  async list(req: Request, res: Response) {
    const activeOnlyRaw = req.query.activeOnly;
    const activeOnly =
      typeof activeOnlyRaw === "boolean"
        ? activeOnlyRaw
        : typeof activeOnlyRaw === "string"
          ? activeOnlyRaw === "true"
          : undefined;

    const alerts = await alertsService.list({
      activeOnly,
      level: req.query.level as string | undefined,
    });
    res.status(200).json(alerts);
  },

  async create(req: Request, res: Response) {
    const alert = await alertsService.create({ ...req.body, userId: req.auth!.userId });
    res.status(201).json(alert);
  },

  async toggle(req: Request, res: Response) {
    const alert = await alertsService.toggle(req.params.id);
    res.status(200).json(alert);
  },
};
