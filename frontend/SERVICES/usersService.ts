import type { UserProfile } from "../TYPES";
import { apiClient } from "./apiClient";

export const usersService = {
  async getCurrentUser(): Promise<UserProfile> {
    const user = await apiClient.get<{
      id: string;
      fullName: string;
      emergencyContact: string | null;
      role: "user" | "admin";
    }>("/users/me", true);

    return {
      id: user.id,
      displayName: user.fullName,
      emergencyContact: user.emergencyContact ?? "",
      role: user.role,
      email: "",
    };
  },

  async listUsers(): Promise<UserProfile[]> {
    const users = await apiClient.get<Array<{ id: string; fullName: string; email: string; role: "user" | "admin" }>>("/users", true);
    return users.map((user) => ({
      id: user.id,
      displayName: user.fullName,
      emergencyContact: "",
      role: user.role,
      email: user.email,
    }));
  },

  async updateUserRole(userId: string, role: "user" | "admin") {
    return apiClient.patch(`/users/${userId}/role`, { role }, true);
  },

  async deleteUser(userId: string) {
    return apiClient.delete(`/users/${userId}`, true);
  },
};
