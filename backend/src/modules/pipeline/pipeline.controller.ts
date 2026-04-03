import type { Request, Response } from "express";
import { pipelineSchedulerService } from "./scheduler.service.js";

export const pipelineController = {
  status(_req: Request, res: Response) {
    res.status(200).json(pipelineSchedulerService.status());
  },

  async trigger(_req: Request, res: Response) {
    const result = await pipelineSchedulerService.triggerNow();
    res.status(200).json(result);
  },
};
