import { execute, queryRows } from "../../config/db.js";
import { pipelineGeocodeService } from "../pipeline/geocode.service.js";
import { routeService, type RoadRoute, type RouteCoordinate } from "./routeService.js";

type DbSafeRoute = {
  id: number;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  route_data: string | null;
  created_at: string;
};

type IncidentPoint = {
  latitude: number;
  longitude: number;
  status: "pending" | "resolved";
};

type StreetLightPoint = {
  latitude: number;
  longitude: number;
  status: "functional" | "broken";
};

type RiskPoint = {
  latitude: number;
  longitude: number;
  risk_score: number;
};

type TrafficAccidentPoint = {
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high";
};

type DrainagePoint = {
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high";
};

type PathPoint = {
  lat: number;
  lng: number;
};

type UnsafeSegment = {
  riskLevel: "medium" | "high";
  averageCrimeLevel: number;
  coordinates: PathPoint[];
  reasons: string[];
};

type AiInsights = {
  pendingIncidents: number;
  brokenLights: number;
  aiRiskScore: number;
};

type SafeRouteRecommendation = {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  distanceMeters: number;
  etaMinutes: number;
  durationSeconds: number;
  riskScore: number;
  safetyScore: number;
  crimeLevel: number;
  keyLandmarks: string[];
  pathPoints: PathPoint[];
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  unsafeSegments: UnsafeSegment[];
  resolvedDestination: {
    label: string;
    lat: number;
    lng: number;
  };
  aiInsights: AiInsights;
  createdAt: string;
};

type SafetyDatasets = {
  incidents: IncidentPoint[];
  streetLights: StreetLightPoint[];
  riskScores: RiskPoint[];
  trafficAccidents: TrafficAccidentPoint[];
  drainageIssues: DrainagePoint[];
};

type PointSafetySummary = {
  crimeLevel: number;
  pendingIncidents: number;
  brokenLights: number;
  functionalLights: number;
  aiRiskScore: number;
  reasons: string[];
};

type SegmentScore = PointSafetySummary & {
  distanceMeters: number;
  points: PathPoint[];
  riskLevel: "low" | "medium" | "high";
};

const EARTH_RADIUS_METERS = 6371000;
const RISK_WEIGHT = 55;
const severityPenalty: Record<"low" | "medium" | "high", number> = {
  low: 18,
  medium: 34,
  high: 55,
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineMeters = (from: RouteCoordinate, to: RouteCoordinate) => {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return EARTH_RADIUS_METERS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const midpoint = (from: PathPoint, to: PathPoint): PathPoint => ({
  lat: (from.lat + to.lat) / 2,
  lng: (from.lng + to.lng) / 2,
});

const normalizeRisk = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 1) return Math.max(0, value * 100);
  return Math.max(0, Math.min(100, value));
};

const parseRouteData = (value: string | null) => {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const toPathPoints = (coordinates: [number, number][]): PathPoint[] =>
  coordinates.map(([lng, lat]) => ({ lat, lng }));

const toSafeRoute = (row: DbSafeRoute, fallbackIndex = 0): SafeRouteRecommendation => {
  const data = parseRouteData(row.route_data);
  const coordinates = Array.isArray(data.geometry)
    ? ((data.geometry as [number, number][]) ?? [])
    : Array.isArray((data.geometry as { coordinates?: [number, number][] } | undefined)?.coordinates)
      ? (((data.geometry as { coordinates?: [number, number][] }).coordinates as [number, number][]) ?? [])
      : [];
  const pathPoints =
    Array.isArray(data.pathPoints) && data.pathPoints.length
      ? (data.pathPoints as PathPoint[])
      : toPathPoints(coordinates);
  const unsafeSegments = Array.isArray(data.unsafeSegments) ? (data.unsafeSegments as UnsafeSegment[]) : [];

  return {
    id: String(row.id),
    name: String(data.name ?? `Route ${fallbackIndex + 1}`),
    startLocation: `${Number(row.start_lat).toFixed(4)}, ${Number(row.start_lng).toFixed(4)}`,
    endLocation: `${Number(row.end_lat).toFixed(4)}, ${Number(row.end_lng).toFixed(4)}`,
    distanceKm: Number(data.distanceKm ?? 0),
    distanceMeters: Number(data.distanceMeters ?? Number(data.distanceKm ?? 0) * 1000),
    etaMinutes: Number(data.etaMinutes ?? 0),
    durationSeconds: Number(data.durationSeconds ?? Number(data.etaMinutes ?? 0) * 60),
    riskScore: Number(data.riskScore ?? 0),
    safetyScore: Number(data.safetyScore ?? 0),
    crimeLevel: Number(data.crimeLevel ?? data.riskScore ?? 0),
    keyLandmarks: Array.isArray(data.keyLandmarks) ? (data.keyLandmarks as string[]) : [],
    pathPoints,
    geometry: {
      type: "LineString",
      coordinates,
    },
    unsafeSegments,
    resolvedDestination: {
      label: String(data.endLocation ?? data.destination ?? "Destination"),
      lat: Number(row.end_lat),
      lng: Number(row.end_lng),
    },
    aiInsights: (data.aiInsights as AiInsights | undefined) ?? {
      pendingIncidents: 0,
      brokenLights: 0,
      aiRiskScore: 0,
    },
    createdAt: row.created_at,
  };
};

const nearbyCount = <T extends { latitude: number; longitude: number }>(
  point: PathPoint,
  rows: T[],
  radiusMeters: number,
  matcher?: (value: T) => boolean
) =>
  rows.filter((row) => (!matcher || matcher(row)) && haversineMeters(point, { lat: Number(row.latitude), lng: Number(row.longitude) }) <= radiusMeters).length;

const nearbyRows = <T extends { latitude: number; longitude: number }>(
  point: PathPoint,
  rows: T[],
  radiusMeters: number,
  matcher?: (value: T) => boolean
) =>
  rows.filter((row) => (!matcher || matcher(row)) && haversineMeters(point, { lat: Number(row.latitude), lng: Number(row.longitude) }) <= radiusMeters);

const summarizePointSafety = (point: PathPoint, datasets: SafetyDatasets): PointSafetySummary => {
  const pendingIncidents = nearbyCount(point, datasets.incidents, 100, (incident) => incident.status === "pending");
  const brokenLights = nearbyCount(point, datasets.streetLights, 70, (light) => light.status === "broken");
  const functionalLights = nearbyCount(point, datasets.streetLights, 70, (light) => light.status === "functional");
  const accidents = nearbyRows(point, datasets.trafficAccidents, 90).reduce(
    (sum, accident) => sum + severityPenalty[accident.severity],
    0
  );
  const drainage = nearbyRows(point, datasets.drainageIssues, 90).reduce(
    (sum, issue) => sum + Math.round(severityPenalty[issue.severity] * 0.65),
    0
  );
  const aiRiskValues = nearbyRows(point, datasets.riskScores, 120).map((risk) => normalizeRisk(Number(risk.risk_score)));
  const aiRiskScore = aiRiskValues.length
    ? aiRiskValues.reduce((sum, value) => sum + value, 0) / aiRiskValues.length
    : 0;

  const rawCrimeLevel =
    pendingIncidents * 18 +
    brokenLights * 10 +
    accidents * 0.75 +
    drainage * 0.55 +
    aiRiskScore * 0.7 -
    functionalLights * 4;

  const reasons: string[] = [];
  if (pendingIncidents) reasons.push(`${pendingIncidents} recent incident${pendingIncidents > 1 ? "s" : ""}`);
  if (brokenLights) reasons.push(`${brokenLights} broken light${brokenLights > 1 ? "s" : ""}`);
  if (accidents >= severityPenalty.medium) reasons.push("accident hotspot");
  if (drainage >= severityPenalty.low) reasons.push("drainage hazard");
  if (aiRiskScore >= 45) reasons.push("elevated AI risk");

  return {
    crimeLevel: Math.max(0, Math.min(100, Math.round(rawCrimeLevel))),
    pendingIncidents,
    brokenLights,
    functionalLights,
    aiRiskScore: Math.round(aiRiskScore),
    reasons,
  };
};

const groupUnsafeSegments = (segments: SegmentScore[]): UnsafeSegment[] => {
  const groups: UnsafeSegment[] = [];
  let current: UnsafeSegment | null = null;

  for (const segment of segments) {
    if (segment.riskLevel === "low") {
      current = null;
      continue;
    }

    if (!current || current.riskLevel !== segment.riskLevel) {
      current = {
        riskLevel: segment.riskLevel,
        averageCrimeLevel: segment.crimeLevel,
        coordinates: [...segment.points],
        reasons: [...segment.reasons],
      };
      groups.push(current);
      continue;
    }

    current.averageCrimeLevel = Math.round((current.averageCrimeLevel + segment.crimeLevel) / 2);
    current.coordinates = [...current.coordinates, segment.points[1]];
    current.reasons = [...new Set([...current.reasons, ...segment.reasons])];
  }

  return groups;
};

const scoreRoute = (
  route: RoadRoute,
  index: number,
  start: RouteCoordinate,
  destination: RouteCoordinate,
  destinationLabel: string,
  datasets: SafetyDatasets
): SafeRouteRecommendation => {
  const pathPoints = toPathPoints(route.geometry.coordinates);
  const segmentScores: SegmentScore[] = [];

  for (let i = 1; i < pathPoints.length; i += 1) {
    const from = pathPoints[i - 1];
    const to = pathPoints[i];
    const pointSummary = summarizePointSafety(midpoint(from, to), datasets);
    const segmentDistance = haversineMeters(from, to);
    const riskLevel =
      pointSummary.crimeLevel >= 60 ? "high" : pointSummary.crimeLevel >= 35 ? "medium" : "low";

    segmentScores.push({
      ...pointSummary,
      distanceMeters: segmentDistance,
      points: [from, to],
      riskLevel,
    });
  }

  const weightedCrimeLevel = segmentScores.length
    ? segmentScores.reduce((sum, segment) => sum + segment.crimeLevel * segment.distanceMeters, 0) /
      Math.max(route.distanceMeters, 1)
    : 0;
  const peakCrimeLevel = segmentScores.length
    ? Math.max(...segmentScores.map((segment) => segment.crimeLevel))
    : 0;
  const highRiskSegments = segmentScores.filter((segment) => segment.riskLevel === "high").length;
  const crimeLevel = Math.min(
    100,
    Math.round(weightedCrimeLevel * 0.7 + peakCrimeLevel * 0.3 + highRiskSegments * 4)
  );
  const safetyScore = Math.round(route.distanceMeters + RISK_WEIGHT * crimeLevel);

  const aiInsights = segmentScores.reduce(
    (summary, segment) => ({
      pendingIncidents: summary.pendingIncidents + segment.pendingIncidents,
      brokenLights: summary.brokenLights + segment.brokenLights,
      aiRiskScore: summary.aiRiskScore + segment.aiRiskScore,
    }),
    { pendingIncidents: 0, brokenLights: 0, aiRiskScore: 0 }
  );

  const unsafeSegments = groupUnsafeSegments(segmentScores);
  const landmarks = [`Start ${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}`];
  if (unsafeSegments.length) {
    landmarks.push(...unsafeSegments.slice(0, 2).map((segment) => `${segment.riskLevel} risk stretch`));
  }
  landmarks.push(destinationLabel);

  return {
    id: `mapbox-route-${index + 1}`,
    name: index === 0 ? "Safest Walking Route" : `Alternative Route ${index + 1}`,
    startLocation: `${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}`,
    endLocation: destinationLabel,
    distanceKm: Number((route.distanceMeters / 1000).toFixed(1)),
    distanceMeters: Math.round(route.distanceMeters),
    etaMinutes: Math.max(1, Math.round(route.durationSeconds / 60)),
    durationSeconds: Math.round(route.durationSeconds),
    riskScore: crimeLevel,
    safetyScore,
    crimeLevel,
    keyLandmarks: landmarks,
    pathPoints,
    geometry: route.geometry,
    unsafeSegments,
    resolvedDestination: {
      label: destinationLabel,
      lat: destination.lat,
      lng: destination.lng,
    },
    aiInsights: {
      pendingIncidents: aiInsights.pendingIncidents,
      brokenLights: aiInsights.brokenLights,
      aiRiskScore: segmentScores.length
        ? Math.round(aiInsights.aiRiskScore / segmentScores.length)
        : 0,
    },
    createdAt: new Date().toISOString(),
  };
};

const ensureSupportTables = async () => {
  await execute(
    `CREATE TABLE IF NOT EXISTS traffic_accidents (
      id INT PRIMARY KEY AUTO_INCREMENT,
      latitude DECIMAL(10,7) NOT NULL,
      longitude DECIMAL(10,7) NOT NULL,
      severity ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
      reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
  await execute(
    `CREATE TABLE IF NOT EXISTS drainage_issues (
      id INT PRIMARY KEY AUTO_INCREMENT,
      latitude DECIMAL(10,7) NOT NULL,
      longitude DECIMAL(10,7) NOT NULL,
      severity ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
      reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
};

const loadSafetyDatasets = async (): Promise<SafetyDatasets> => {
  await ensureSupportTables();

  const [incidents, streetLights, riskScores, trafficAccidents, drainageIssues] = await Promise.all([
    queryRows<IncidentPoint>(
      `SELECT latitude, longitude, status
       FROM incidents
       WHERE reported_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)`
    ),
    queryRows<StreetLightPoint>("SELECT latitude, longitude, status FROM street_lights"),
    queryRows<RiskPoint>(
      `SELECT latitude, longitude, risk_score
       FROM ai_risk_scores
       WHERE calculated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    ),
    queryRows<TrafficAccidentPoint>(
      `SELECT latitude, longitude, severity
       FROM traffic_accidents
       WHERE reported_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)`
    ),
    queryRows<DrainagePoint>(
      `SELECT latitude, longitude, severity
       FROM drainage_issues
       WHERE reported_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    ),
  ]);

  return { incidents, streetLights, riskScores, trafficAccidents, drainageIssues };
};

export const routesService = {
  async listAll() {
    const result = await queryRows<DbSafeRoute>(
      `SELECT id, start_lat, start_lng, end_lat, end_lng, route_data, created_at
       FROM safe_routes
       ORDER BY created_at DESC
       LIMIT 100`
    );
    return result.map((row, index) => toSafeRoute(row, index));
  },

  async create(input: {
    name: string;
    startLocation: string;
    endLocation: string;
    distanceKm: number;
    etaMinutes: number;
    riskScore: number;
    keyLandmarks: string[];
  }) {
    const parseCoordinates = (value: string) => {
      const [lat, lng] = value.split(",").map((item) => Number(item.trim()));
      return {
        lat: Number.isFinite(lat) ? lat : -1.286389,
        lng: Number.isFinite(lng) ? lng : 36.817223,
      };
    };

    const start = parseCoordinates(input.startLocation);
    const end = parseCoordinates(input.endLocation);
    const routeData = JSON.stringify({
      name: input.name,
      distanceKm: input.distanceKm,
      distanceMeters: Math.round(input.distanceKm * 1000),
      etaMinutes: input.etaMinutes,
      durationSeconds: input.etaMinutes * 60,
      riskScore: input.riskScore,
      safetyScore: Math.round(input.distanceKm * 1000 + RISK_WEIGHT * input.riskScore),
      crimeLevel: input.riskScore,
      keyLandmarks: input.keyLandmarks,
      geometry: { type: "LineString", coordinates: [] },
      pathPoints: [],
      unsafeSegments: [],
      aiInsights: { pendingIncidents: 0, brokenLights: 0, aiRiskScore: 0 },
      endLocation: input.endLocation,
    });

    const insert = await execute(
      `INSERT INTO safe_routes (start_lat, start_lng, end_lat, end_lng, route_data, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [start.lat, start.lng, end.lat, end.lng, routeData]
    );

    const result = await queryRows<DbSafeRoute>(
      `SELECT id, start_lat, start_lng, end_lat, end_lng, route_data, created_at
       FROM safe_routes WHERE id = ? LIMIT 1`,
      [insert.insertId]
    );

    return toSafeRoute(result[0], 0);
  },

  async recommend(input: { startLat: number; startLng: number; destination?: string; endLat?: number; endLng?: number }) {
    const datasets = await loadSafetyDatasets();
    const start = { lat: Number(input.startLat), lng: Number(input.startLng) };

    const resolvedDestination =
      typeof input.endLat === "number" && typeof input.endLng === "number"
        ? { latitude: input.endLat, longitude: input.endLng }
        : await pipelineGeocodeService.geocodeLocation(input.destination ?? "");

    const destination = {
      lat: Number(resolvedDestination.latitude),
      lng: Number(resolvedDestination.longitude),
    };
    const destinationLabel =
      input.destination?.trim() || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`;

    const roadRoutes = await routeService.getWalkingRoutes(start, destination);

    return roadRoutes
      .map((route, index) => scoreRoute(route, index, start, destination, destinationLabel, datasets))
      .sort((a, b) => a.safetyScore - b.safetyScore)
      .map((route, index) => ({
        ...route,
        name: index === 0 ? "Safest Walking Route" : `Alternative Route ${index + 1}`,
      }));
  },
};
