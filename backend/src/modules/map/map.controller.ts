import type { Request, Response } from "express";
import { mapService } from "./map.service.js";

export const mapController = {
  async nairobiLayers(_req: Request, res: Response) {
    const payload = await mapService.getNairobiLayers();
    res.status(200).json(payload);
  },
};
