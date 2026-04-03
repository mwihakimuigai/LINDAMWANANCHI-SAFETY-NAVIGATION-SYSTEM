import type { Request, Response } from "express";
import { incidentsService } from "./incidents.service.js";

export const incidentsController = {
  async list(req: Request, res: Response) {
    const incidents = await incidentsService.list({
      severity: req.query.severity as string | undefined,
      type: req.query.type as string | undefined,
      status: req.query.status as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sinceId: req.query.sinceId ? Number(req.query.sinceId) : undefined,
      source: req.query.source as string | undefined,
    });
    res.status(200).json(incidents);
  },

  async getById(req: Request, res: Response) {
    const incident = await incidentsService.getById(req.params.id);
    res.status(200).json(incident);
  },

  async create(req: Request, res: Response) {
    const incident = await incidentsService.create({
      ...req.body,
      userId: req.auth!.userId,
    });
    res.status(201).json(incident);
  },

  async verify(req: Request, res: Response) {
    const incident = await incidentsService.verify(req.params.id);
    res.status(200).json(incident);
  },

  async updateStatus(req: Request, res: Response) {
    const incident = await incidentsService.updateStatus(req.params.id, req.body.status);
    res.status(200).json(incident);
  },
};
