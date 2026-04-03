import type { Request, Response } from "express";
import { intelService } from "./intel.service.js";

export const intelController = {
  async list(_req: Request, res: Response) {
    const reports = await intelService.listRecent();
    res.status(200).json(reports);
  },

  async sync(_req: Request, res: Response) {
    const result = await intelService.ingestReliefWeb();
    res.status(200).json(result);
  },
};
