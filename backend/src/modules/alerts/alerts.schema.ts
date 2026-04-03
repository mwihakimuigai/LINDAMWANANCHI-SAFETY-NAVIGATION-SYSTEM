import { z } from "zod";

export const listAlertsQuerySchema = z.object({
  activeOnly: z.any().optional(),
  level: z.enum(["advisory", "warning", "critical"]).optional(),
});

export const createAlertSchema = z.object({
  title: z.string().min(3).optional(),
  message: z.string().min(5),
  level: z.enum(["advisory", "warning", "critical"]),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});
