const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const buildError = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    throw new Error(data.message || data.error || fallback);
  } catch (error) {
    if (error instanceof Error && error.message !== "Unexpected end of JSON input") {
      throw error;
    }
    throw new Error(fallback);
  }
};

export const authStorage = {
  getToken() {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("lm_token") ?? "";
  },
  setToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("lm_token", token);
  },
  clearToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("lm_token");
  },
};

export const workspaceStorage = {
  getMode(): "user" | "admin" {
    if (typeof window === "undefined") return "user";
    const value = localStorage.getItem("lm_workspace_mode");
    return value === "admin" ? "admin" : "user";
  },
  setMode(mode: "user" | "admin") {
    if (typeof window === "undefined") return;
    localStorage.setItem("lm_workspace_mode", mode);
  },
  clearMode() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("lm_workspace_mode");
  },
};

export const apiClient = {
  async get<T>(path: string, withAuth = false): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: withAuth
        ? {
            Authorization: `Bearer ${authStorage.getToken()}`,
          }
        : undefined,
    });
    if (!response.ok) {
      await buildError(response, `GET ${path} failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  },

  async post<T>(path: string, body: unknown, withAuth = false): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(withAuth ? { Authorization: `Bearer ${authStorage.getToken()}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      await buildError(response, `POST ${path} failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  },

  async patch<T>(path: string, body: unknown, withAuth = false): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(withAuth ? { Authorization: `Bearer ${authStorage.getToken()}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      await buildError(response, `PATCH ${path} failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  },

  async delete<T>(path: string, withAuth = false): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: withAuth ? { Authorization: `Bearer ${authStorage.getToken()}` } : undefined,
    });
    if (!response.ok) {
      await buildError(response, `DELETE ${path} failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  },
};
