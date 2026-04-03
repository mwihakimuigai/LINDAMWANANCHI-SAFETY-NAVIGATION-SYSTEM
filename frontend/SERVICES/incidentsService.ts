import type { Incident, SafetyAlert } from "../TYPES";
import { apiClient } from "./apiClient";

const INCIDENTS: Incident[] = [
  {
    id: "inc-001",
    title: "Phone snatching reported",
    type: "theft",
    severity: "medium",
    locationName: "Tom Mboya Street",
    coordinates: { lat: -1.2833, lng: 36.8219 },
    reportedAt: "2026-03-21T07:30:00+03:00",
    verified: true,
  },
  {
    id: "inc-002",
    title: "Unsafe crowd buildup",
    type: "harassment",
    severity: "high",
    locationName: "River Road",
    coordinates: { lat: -1.2812, lng: 36.8261 },
    reportedAt: "2026-03-21T09:20:00+03:00",
    verified: false,
  },
  {
    id: "inc-003",
    title: "Minor collision near stage",
    type: "road",
    severity: "low",
    locationName: "Moi Avenue",
    coordinates: { lat: -1.2856, lng: 36.8229 },
    reportedAt: "2026-03-21T10:10:00+03:00",
    verified: true,
  },
];

const ALERTS: SafetyAlert[] = [
  {
    id: "al-001",
    message: "Avoid River Road after 8PM due to increased harassment reports.",
    createdAt: "2026-03-21T11:00:00+03:00",
    level: "warning",
  },
  {
    id: "al-002",
    message: "Emergency responders are active near Tom Mboya Street.",
    createdAt: "2026-03-21T10:45:00+03:00",
    level: "advisory",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let lastIncidentId = 0;

export const incidentsService = {
  async listIncidents(): Promise<Incident[]> {
    try {
      const result = await apiClient.get<Incident[]>(
        lastIncidentId > 0 ? `/incidents?sinceId=${lastIncidentId}&limit=100` : "/incidents?limit=100"
      );
      if (result.length > 0) {
        const highest = Math.max(...result.map((item) => Number(item.id)));
        if (!Number.isNaN(highest)) lastIncidentId = Math.max(lastIncidentId, highest);
      }
      return result;
    } catch {
      await delay(250);
      return INCIDENTS;
    }
  },

  async listAlerts(): Promise<SafetyAlert[]> {
    try {
      return await apiClient.get<SafetyAlert[]>("/alerts?activeOnly=true");
    } catch {
      await delay(180);
      return ALERTS;
    }
  },

  async createIncident(payload: {
    title: string;
    description: string;
    type: Incident["type"];
    severity: Incident["severity"];
    locationName: string;
    latitude: number;
    longitude: number;
    photo?: string;
  }) {
    return apiClient.post<Incident>("/incidents", payload, true);
  },
};
