import type { Request, Response } from "express";
import { sosService } from "./sos.service.js";

export const sosController = {
  async setContact(req: Request, res: Response) {
    const contact = await sosService.setEmergencyContact(req.body);
    res.status(200).json(contact);
  },

  async getContact(req: Request, res: Response) {
    const userId = Number(req.query.userId ?? 1);
    const contact = await sosService.getEmergencyContact(userId);
    res.status(200).json(contact);
  },

  async trigger(req: Request, res: Response) {
    const result = await sosService.trigger(req.body);
    res.status(200).json(result);
  },
};
