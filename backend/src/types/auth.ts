export type UserRole = "user" | "admin";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  emergencyContact: string | null;
  createdAt: string;
}
