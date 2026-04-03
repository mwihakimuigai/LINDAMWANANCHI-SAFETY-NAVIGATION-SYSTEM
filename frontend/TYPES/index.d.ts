export type Coordinates = {
  lat: number;
  lng: number;
};

export type RouteGeometry = {
  type: "LineString";
  coordinates: Array<[number, number]>;
};

export type UnsafeRouteSegment = {
  riskLevel: "medium" | "high";
  averageCrimeLevel: number;
  coordinates: Coordinates[];
  reasons: string[];
};

export type IncidentSeverity = "low" | "medium" | "high";
export type IncidentType = "theft" | "harassment" | "violence" | "medical" | "road";

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  source?: "news" | "user";
  locationName: string;
  coordinates: Coordinates;
  reportedAt: string;
  verified: boolean;
  status?: string;
  description?: string;
  reportedBy?: string;
  photo?: string | null;
}

export interface SafeRoute {
  id: string;
  name: string;
  etaMinutes: number;
  distanceKm: number;
  distanceMeters?: number;
  durationSeconds?: number;
  riskScore: number;
  safetyScore?: number;
  crimeLevel?: number;
  keyLandmarks: string[];
  pathPoints?: Array<{ lat: number; lng: number }>;
  geometry?: RouteGeometry;
  unsafeSegments?: UnsafeRouteSegment[];
  resolvedDestination?: {
    label: string;
    lat: number;
    lng: number;
  };
  aiInsights?: {
    pendingIncidents: number;
    brokenLights: number;
    aiRiskScore: number;
  };
}

export interface SafetyAlert {
  id: string;
  message: string;
  createdAt: string;
  level: "advisory" | "warning" | "critical";
}

export interface UserProfile {
  id: string;
  displayName: string;
  emergencyContact: string;
  role: "user" | "admin";
  email?: string;
}
