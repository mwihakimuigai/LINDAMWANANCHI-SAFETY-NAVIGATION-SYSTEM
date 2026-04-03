import { z } from "zod";

export const recommendationQuerySchema = z.object({
  startLat: z.coerce.number().min(-90).max(90),
  startLng: z.coerce.number().min(-180).max(180),
  destination: z.string().min(2).optional(),
  endLat: z.coerce.number().min(-90).max(90).optional(),
  endLng: z.coerce.number().min(-180).max(180).optional(),
});

export const createRouteSchema = z.object({
  name: z.string().min(2),
  startLocation: z.string().min(2),
  endLocation: z.string().min(2),
  distanceKm: z.coerce.number().positive(),
  etaMinutes: z.coerce.number().int().positive(),
  riskScore: z.coerce.number().min(0).max(100),
  keyLandmarks: z.array(z.string().min(2)).min(1),
});
