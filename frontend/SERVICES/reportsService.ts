import { apiClient } from "./apiClient";

export type DashboardAnalytics = {
  users: number;
  incidents: number;
  activeAlerts: number;
  resolutionRate: number;
  incidentsBySeverity: Array<{ severity: string; count: number }>;
  incidentsByType: Array<{ type: string; count: number }>;
  alertsByType?: Array<{ type: string; count: number }>;
  userRoles?: Array<{ role: string; count: number }>;
  incidentsBySource?: Array<{ source: string; count: number }>;
  incidentsByHour?: Array<{ hour: string; count: number }>;
  streetLightHealth?: Array<{ status: string; count: number }>;
  riskBands?: Array<{ band: string; count: number }>;
  recentReports?: Array<{
    id: number;
    title: string;
    type: string;
    status: string;
    date: string;
    locationName: string;
  }>;
  hotspots?: Array<{ name: string; count: number }>;
  trends?: {
    incidents: Array<{ day: string; count: number }>;
    alerts: Array<{ day: string; count: number }>;
  };
};

export const reportsService = {
  async getDashboard(): Promise<DashboardAnalytics | null> {
    try {
      return await apiClient.get<DashboardAnalytics>("/reports/dashboard", true);
    } catch {
      return null;
    }
  },

  async exportReport(): Promise<unknown> {
    return apiClient.get("/reports/export", true);
  },
};
