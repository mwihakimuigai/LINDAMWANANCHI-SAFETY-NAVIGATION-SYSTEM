import { apiClient, authStorage, workspaceStorage } from "./apiClient";

type AuthResponse = {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "user" | "admin";
  };
};

export const authService = {
  async register(payload: { fullName: string; email: string; password: string; username?: string }) {
    const result = await apiClient.post<AuthResponse>("/auth/register", payload);
    authStorage.setToken(result.token);
    workspaceStorage.setMode("user");
    return result;
  },

  async login(payload: { identifier: string; password: string }, mode: "user" | "admin" = "user") {
    const result = await apiClient.post<AuthResponse>("/auth/login", payload);
    authStorage.setToken(result.token);
    workspaceStorage.setMode(mode);
    return result;
  },

  logout() {
    authStorage.clearToken();
    workspaceStorage.clearMode();
  },
};
