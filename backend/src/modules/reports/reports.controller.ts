import type { Request, Response } from "express";
import { reportsService } from "./reports.service.js";

export const reportsController = {
  async dashboard(_req: Request, res: Response) {
    const report = await reportsService.dashboard();
    res.status(200).json(report);
  },

  async exportReport(_req: Request, res: Response) {
    const report = await reportsService.exportReport();
    res.status(200).json(report);
  },
};
