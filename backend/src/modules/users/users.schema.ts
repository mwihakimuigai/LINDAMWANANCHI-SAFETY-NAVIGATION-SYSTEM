import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneNumber: z.string().min(7).optional().nullable(),
  emergencyContact: z.string().min(7).optional().nullable(),
});

export const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});
