import { queryRows } from "../../config/db.js";
import { execute } from "../../config/db.js";
import { pipelineSchemaService } from "../pipeline/schema.service.js";

type StreetLightRow = {
  id: number;
  latitude: number;
  longitude: number;
  status: "functional" | "broken";
  source: string | null;
  source_ref: string | null;
  condition_label: string | null;
  notes: string | null;
};

type IncidentRow = {
  id: number;
  title: string | null;
  location_name: string | null;
  crime_type: string | null;
  severity: "low" | "medium" | "high" | null;
  incident_type: string;
  latitude: number;
  longitude: number;
  status: "pending" | "resolved";
  created_at: string | null;
};

type RiskRow = {
  id: number;
  latitude: number;
  longitude: number;
  risk_score: number;
};

type TrafficAccidentRow = {
  id: number;
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high";
};

type DrainageRow = {
  id: number;
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high";
};

type ExternalReportRow = {
  id: number;
  latitude: number;
  longitude: number;
  category: string;
  severity: "low" | "medium" | "high";
};

export const mapService = {
  async getNairobiLayers() {
    await pipelineSchemaService.ensureSchema();

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
    await execute(
      `CREATE TABLE IF NOT EXISTS external_reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category VARCHAR(80) NOT NULL,
        source VARCHAR(120) NOT NULL,
        latitude DECIMAL(10,7) NOT NULL,
        longitude DECIMAL(10,7) NOT NULL,
        severity ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
        details TEXT NULL,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    const [streetLights, incidents, riskScores, trafficAccidents, drainageIssues, externalReports] = await Promise.all([
      queryRows<StreetLightRow>(
        "SELECT id, latitude, longitude, status, source, source_ref, condition_label, notes FROM street_lights"
      ),
      queryRows<IncidentRow>(
        `SELECT id, title, location_name, crime_type, severity, incident_type, latitude, longitude, status, created_at
         FROM incidents
         WHERE status = 'pending'
         ORDER BY created_at DESC
         LIMIT 300`
      ),
      queryRows<RiskRow>(
        `SELECT id, latitude, longitude, risk_score
         FROM ai_risk_scores
         WHERE risk_score >= 0.65
         ORDER BY calculated_at DESC
         LIMIT 300`
      ),
      queryRows<TrafficAccidentRow>(
        `SELECT id, latitude, longitude, severity
         FROM traffic_accidents
         WHERE reported_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)`
      ),
      queryRows<DrainageRow>(
        `SELECT id, latitude, longitude, severity
         FROM drainage_issues
         WHERE reported_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      ),
      queryRows<ExternalReportRow>(
        `SELECT id, latitude, longitude, category, severity
         FROM external_reports
         WHERE reported_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)`
      ),
    ]);

    return {
      center: { lat: -1.286389, lng: 36.817223, label: "Nairobi CBD" },
      streetLights: streetLights.map((l) => ({
        id: String(l.id),
        lat: Number(l.latitude),
        lng: Number(l.longitude),
        status: l.status,
        source: l.source ?? "manual",
        sourceRef: l.source_ref ?? undefined,
        conditionLabel: l.condition_label ?? l.status,
        notes: l.notes ?? undefined,
      })),
      dangerZones: [
        ...incidents.map((i) => ({
          id: `inc-${i.id}`,
          lat: Number(i.latitude),
          lng: Number(i.longitude),
          source: "incident",
          label: i.title ?? i.incident_type,
          severity: i.severity ?? "high",
          locationName: i.location_name ?? "Nairobi",
          crimeType: i.crime_type ?? i.incident_type,
          createdAt: i.created_at ?? new Date().toISOString(),
        })),
        ...riskScores.map((r) => ({
          id: `risk-${r.id}`,
          lat: Number(r.latitude),
          lng: Number(r.longitude),
          source: "ai_risk",
          label: `AI risk ${(Number(r.risk_score) * 100).toFixed(0)}%`,
          severity: Number(r.risk_score) >= 0.8 ? "high" : "medium",
          locationName: "Nairobi",
          crimeType: "risk",
          createdAt: new Date().toISOString(),
        })),
        ...trafficAccidents.map((a) => ({
          id: `acc-${a.id}`,
          lat: Number(a.latitude),
          lng: Number(a.longitude),
          source: "traffic_accident",
          label: "Traffic accident",
          severity: a.severity,
          locationName: "Nairobi road",
          crimeType: "accident",
          createdAt: new Date().toISOString(),
        })),
        ...drainageIssues.map((d) => ({
          id: `drn-${d.id}`,
          lat: Number(d.latitude),
          lng: Number(d.longitude),
          source: "drainage",
          label: "Drainage/flooding issue",
          severity: d.severity,
          locationName: "Nairobi drainage",
          crimeType: "drainage",
          createdAt: new Date().toISOString(),
        })),
        ...externalReports.map((e) => ({
          id: `ext-${e.id}`,
          lat: Number(e.latitude),
          lng: Number(e.longitude),
          source: "external_report",
          label: e.category,
          severity: e.severity,
          locationName: "Nairobi",
          crimeType: e.category,
          createdAt: new Date().toISOString(),
        })),
      ],
    };
  },
};
