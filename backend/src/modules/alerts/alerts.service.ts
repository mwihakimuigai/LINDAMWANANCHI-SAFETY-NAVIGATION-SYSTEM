import { execute, queryRows } from "../../config/db.js";
import { HttpError } from "../../utils/http.js";

type DbAlert = {
  id: number;
  title: string;
  message: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  alert_type: "safety" | "emergency" | "update";
};

const mapLevel = (type: DbAlert["alert_type"]) => {
  if (type === "emergency") return "critical";
  if (type === "update") return "advisory";
  return "warning";
};

const mapAlert = (alert: DbAlert) => ({
  id: String(alert.id),
  title: alert.title,
  message: alert.message,
  level: mapLevel(alert.alert_type),
  active: true,
  createdAt: alert.created_at,
  createdBy: "system",
  coordinates:
    alert.latitude !== null && alert.longitude !== null
      ? { lat: Number(alert.latitude), lng: Number(alert.longitude) }
      : null,
});

export const alertsService = {
  async list(input: { activeOnly?: boolean; level?: string }) {
    const filters: string[] = [];
    const params: unknown[] = [];

    if (input.level) {
      const type = input.level === "critical" ? "emergency" : input.level === "advisory" ? "update" : "safety";
      filters.push("alert_type = ?");
      params.push(type);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const result = await queryRows<DbAlert>(
      `SELECT id, title, message, latitude, longitude, created_at, alert_type
       FROM alerts
       ${where}
       ORDER BY created_at DESC
       LIMIT 100`,
      params
    );

    return result.map(mapAlert);
  },

  async create(input: {
    title?: string;
    message: string;
    level: "advisory" | "warning" | "critical";
    latitude?: number | null;
    longitude?: number | null;
    userId: string;
  }) {
    const alertType = input.level === "critical" ? "emergency" : input.level === "advisory" ? "update" : "safety";
    const insert = await execute(
      `INSERT INTO alerts (title, message, latitude, longitude, alert_type, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [input.title ?? "Safety Alert", input.message, input.latitude ?? null, input.longitude ?? null, alertType]
    );

    const result = await queryRows<DbAlert>(
      "SELECT id, title, message, latitude, longitude, created_at, alert_type FROM alerts WHERE id = ? LIMIT 1",
      [insert.insertId]
    );
    return mapAlert(result[0]);
  },

  async toggle(id: string) {
    const result = await queryRows<DbAlert>(
      "SELECT id, title, message, latitude, longitude, created_at, alert_type FROM alerts WHERE id = ? LIMIT 1",
      [id]
    );
    const alert = result[0];
    if (!alert) throw new HttpError(404, "Alert not found");
    return mapAlert(alert);
  },
};
