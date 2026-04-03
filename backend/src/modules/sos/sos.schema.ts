import { z } from "zod";

export const setEmergencyContactSchema = z.object({
  userId: z.coerce.number().int().positive().default(1),
  contactName: z.string().min(2),
  contactPhone: z.string().min(7),
  relationship: z.string().min(2).default("Emergency Contact"),
});

export const triggerSosSchema = z.object({
  userId: z.coerce.number().int().positive().default(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  message: z.string().optional(),
});
