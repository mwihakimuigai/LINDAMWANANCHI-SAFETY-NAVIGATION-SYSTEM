import { execute, queryRows } from "../../config/db.js";
import { pipelineSchemaService } from "../pipeline/schema.service.js";
import { HttpError } from "../../utils/http.js";

type DbIncident = {
  id: number;
  user_id: number;
  title: string | null;
  location_name: string | null;
  crime_type: string | null;
  severity: "low" | "medium" | "high" | null;
  source: "news" | "user" | null;
  incident_type: string;
  description: string;
  latitude: number;
  longitude: number;
  photo: string | null;
  status: "pending" | "resolved";
  reported_at: string;
  created_at: string | null;
};

const toIncidentResponse = (incident: DbIncident) => {
  const normalized = incident.incident_type.toLowerCase();
  const mappedType =
    normalized.includes("theft")
      ? "theft"
      : normalized.includes("harass")
        ? "harassment"
        : normalized.includes("violence")
          ? "violence"
          : normalized.includes("medical")
            ? "medical"
            : "road";

  return {
  id: String(incident.id),
  title: incident.title ?? incident.incident_type,
  description: incident.description,
  type: (incident.crime_type as "theft" | "harassment" | "violence" | "medical" | "road") ?? mappedType,
  severity: incident.severity ?? (incident.status === "resolved" ? "low" : "medium"),
  source: incident.source ?? "user",
  locationName: incident.location_name ?? `${Number(incident.latitude).toFixed(4)}, ${Number(incident.longitude).toFixed(4)}`,
  coordinates: {
    lat: Number(incident.latitude),
    lng: Number(incident.longitude),
  },
  reportedBy: String(incident.user_id),
  verified: incident.status === "resolved",
  status: incident.status,
  reportedAt: incident.created_at ?? incident.reported_at,
  photo: incident.photo,
  };
};

export const incidentsService = {
  async list(input: { severity?: string; type?: string; status?: string; limit?: number; sinceId?: number; source?: string }) {
    await pipelineSchemaService.ensureSchema();

    const filters: string[] = [];
    const params: unknown[] = [];

    if (input.severity) {
      if (input.severity === "low") {
        filters.push("status = 'resolved'");
      } else {
        filters.push("status = 'pending'");
      }
    }
    if (input.type) {
      filters.push("incident_type = ?");
      params.push(input.type);
    }
    if (input.status) {
      filters.push("status = ?");
      params.push(input.status);
    }
    if (input.sinceId) {
      filters.push("id > ?");
      params.push(input.sinceId);
    }
    if (input.source) {
      filters.push("source = ?");
      params.push(input.source);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const limit = input.limit ?? 100;
    params.push(limit);

    const result = await queryRows<DbIncident>(
      `SELECT id, user_id, title, location_name, crime_type, severity, source, incident_type, description, latitude, longitude, photo, status, reported_at, created_at
       FROM incidents
       ${where}
       ORDER BY id DESC
       LIMIT ?`,
      params
    );

    return result.map(toIncidentResponse);
  },

  async getById(id: string) {
    await pipelineSchemaService.ensureSchema();

    const result = await queryRows<DbIncident>(
      `SELECT id, user_id, title, location_name, crime_type, severity, source, incident_type, description, latitude, longitude, photo, status, reported_at, created_at
       FROM incidents WHERE id = ? LIMIT 1`,
      [id]
    );
    const incident = result[0];
    if (!incident) throw new HttpError(404, "Incident not found");
    return toIncidentResponse(incident);
  },

  async create(input: {
    title: string;
    description: string;
    type: "theft" | "harassment" | "violence" | "medical" | "road";
    severity: "low" | "medium" | "high";
    locationName: string;
    latitude: number;
    longitude: number;
    photo?: string;
    userId: string;
  }) {
    await pipelineSchemaService.ensureSchema();

    const incidentType = input.type;
    const result = await execute(
      `INSERT INTO incidents (
         user_id, incident_type, description, latitude, longitude, photo, status, reported_at,
         title, location_name, crime_type, severity, source, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), ?, ?, ?, ?, 'user', NOW())`,
      [
        Number(input.userId),
        incidentType,
        input.description,
        input.latitude,
        input.longitude,
        input.photo ?? null,
        input.title,
        input.locationName,
        input.type,
        input.severity,
      ]
    );

    return this.getById(String(result.insertId));
  },

  async verify(id: string) {
    await execute("UPDATE incidents SET status = 'resolved' WHERE id = ?", [id]);
    return this.getById(id);
  },

  async updateStatus(id: string, status: "pending" | "resolved") {
    await execute("UPDATE incidents SET status = ? WHERE id = ?", [status, id]);
    return this.getById(id);
  },
};
