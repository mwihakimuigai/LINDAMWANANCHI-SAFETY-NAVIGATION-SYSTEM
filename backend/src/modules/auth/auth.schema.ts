import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(120).optional(),
  phoneNumber: z.string().min(7).optional(),
  emergencyContact: z.string().min(7).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(8),
});
