import type { Coordinates, Incident, SafeRoute } from "../TYPES";
import { apiClient } from "./apiClient";

type RouteInput = {
  userLocation: Coordinates;
  destination: string;
  incidents: Incident[];
};

const BASE_ROUTES: Omit<SafeRoute, "riskScore">[] = [
  {
    id: "rt-001",
    name: "City Hall Route",
    etaMinutes: 18,
    distanceKm: 3.4,
    distanceMeters: 3400,
    durationSeconds: 1080,
    safetyScore: 5000,
    crimeLevel: 30,
    keyLandmarks: ["City Hall Way", "Kenyatta Avenue"],
    pathPoints: [],
    geometry: { type: "LineString", coordinates: [] },
    unsafeSegments: [],
  },
  {
    id: "rt-002",
    name: "University Way",
    etaMinutes: 22,
    distanceKm: 3.7,
    distanceMeters: 3700,
    durationSeconds: 1320,
    safetyScore: 5600,
    crimeLevel: 34,
    keyLandmarks: ["University Way", "Moi Avenue"],
    pathPoints: [],
    geometry: { type: "LineString", coordinates: [] },
    unsafeSegments: [],
  },
  {
    id: "rt-003",
    name: "Uhuru Park Edge",
    etaMinutes: 25,
    distanceKm: 4.1,
    distanceMeters: 4100,
    durationSeconds: 1500,
    safetyScore: 6200,
    crimeLevel: 38,
    keyLandmarks: ["Uhuru Highway", "Harambee Avenue"],
    pathPoints: [],
    geometry: { type: "LineString", coordinates: [] },
    unsafeSegments: [],
  },
];

const severityWeight: Record<Incident["severity"], number> = {
  low: 8,
  medium: 20,
  high: 35,
};

const routePenalty = (routeName: string, incidents: Incident[]) => {
  const name = routeName.toLowerCase();
  return incidents
    .filter((incident) => {
      const incidentName = incident.locationName.toLowerCase();
      return name.includes("way")
        ? incidentName.includes("avenue") || incidentName.includes("way")
        : incidentName.includes("road") || incidentName.includes("street");
    })
    .reduce((sum, item) => sum + severityWeight[item.severity], 0);
};

export const locationsService = {
  async getSafeRoutes(input: RouteInput): Promise<SafeRoute[]> {
    return apiClient.get<SafeRoute[]>(
      `/routes/recommend?startLat=${input.userLocation.lat}&startLng=${input.userLocation.lng}&destination=${encodeURIComponent(
        input.destination
      )}`
    );
  },
};
