import { z } from "zod";

export const listIncidentsQuerySchema = z.object({
  severity: z.enum(["low", "medium", "high"]).optional(),
  type: z.enum(["theft", "harassment", "violence", "medical", "road"]).optional(),
  status: z.enum(["pending", "resolved"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  sinceId: z.coerce.number().int().positive().optional(),
  source: z.enum(["news", "user"]).optional(),
});

export const createIncidentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  type: z.enum(["theft", "harassment", "violence", "medical", "road"]),
  severity: z.enum(["low", "medium", "high"]),
  locationName: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  photo: z.string().max(512).optional(),
});

export const updateIncidentStatusSchema = z.object({
  status: z.enum(["pending", "resolved"]),
});
