import { queryRows } from "../../config/db.js";

type CountRow = { count: string };
type StatusRow = { status: "pending" | "resolved"; count: string };
type TypeRow = { incident_type: string; count: string };
type AlertRow = { alert_type: string; count: string };
type DayRow = { day: string; count: string };
type RoleRow = { role: string; count: string };
type SourceRow = { source: string; count: string };
type HourRow = { hour_bucket: string; count: string };
type StreetLightRow = { status: string; count: string };
type RiskBandRow = { band: string; count: string };
type RecentIncidentRow = {
  id: number;
  title: string | null;
  incident_type: string;
  status: "pending" | "resolved";
  created_at: string | null;
  reported_at: string;
  location_name: string | null;
};
type HotspotRow = {
  hotspot: string;
  count: string;
};

const buildDashboardPayload = async () => {
  const [
    users,
    incidents,
    alerts,
    byStatus,
    byType,
    byAlertType,
    resolvedRate,
    incidentTrend,
    alertTrend,
    userRoles,
    incidentsBySource,
    incidentsByHour,
    streetLightHealth,
    riskBands,
    recentReports,
    hotspots,
  ] = await Promise.all([
    queryRows<CountRow>("SELECT CAST(COUNT(*) AS CHAR) AS count FROM users"),
    queryRows<CountRow>("SELECT CAST(COUNT(*) AS CHAR) AS count FROM incidents"),
    queryRows<CountRow>("SELECT CAST(COUNT(*) AS CHAR) AS count FROM alerts"),
    queryRows<StatusRow>("SELECT status, CAST(COUNT(*) AS CHAR) AS count FROM incidents GROUP BY status"),
    queryRows<TypeRow>("SELECT incident_type, CAST(COUNT(*) AS CHAR) AS count FROM incidents GROUP BY incident_type"),
    queryRows<AlertRow>("SELECT alert_type, CAST(COUNT(*) AS CHAR) AS count FROM alerts GROUP BY alert_type"),
    queryRows<{ resolved: string; total: string }>(
      `SELECT
        CAST(SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS CHAR) AS resolved,
        CAST(COUNT(*) AS CHAR) AS total
       FROM incidents`
    ),
    queryRows<DayRow>(
      `SELECT DATE_FORMAT(reported_at, '%a') AS day, CAST(COUNT(*) AS CHAR) AS count
       FROM incidents
       WHERE reported_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE_FORMAT(reported_at, '%a')
       ORDER BY MIN(reported_at)`
    ),
    queryRows<DayRow>(
      `SELECT DATE_FORMAT(created_at, '%a') AS day, CAST(COUNT(*) AS CHAR) AS count
       FROM alerts
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE_FORMAT(created_at, '%a')
       ORDER BY MIN(created_at)`
    ),
    queryRows<RoleRow>(
      `SELECT COALESCE(role, 'user') AS role, CAST(COUNT(*) AS CHAR) AS count
       FROM users
       GROUP BY COALESCE(role, 'user')`
    ),
    queryRows<SourceRow>(
      `SELECT COALESCE(source, 'user') AS source, CAST(COUNT(*) AS CHAR) AS count
       FROM incidents
       GROUP BY COALESCE(source, 'user')`
    ),
    queryRows<HourRow>(
      `SELECT LPAD(HOUR(COALESCE(created_at, reported_at)), 2, '0') AS hour_bucket, CAST(COUNT(*) AS CHAR) AS count
       FROM incidents
       GROUP BY LPAD(HOUR(COALESCE(created_at, reported_at)), 2, '0')
       ORDER BY hour_bucket`
    ),
    queryRows<StreetLightRow>(
      `SELECT status, CAST(COUNT(*) AS CHAR) AS count
       FROM street_lights
       GROUP BY status`
    ),
    queryRows<RiskBandRow>(
      `SELECT
        CASE
          WHEN risk_score >= 0.7 THEN 'High'
          WHEN risk_score >= 0.4 THEN 'Medium'
          ELSE 'Low'
        END AS band,
        CAST(COUNT(*) AS CHAR) AS count
       FROM ai_risk_scores
       GROUP BY
        CASE
          WHEN risk_score >= 0.7 THEN 'High'
          WHEN risk_score >= 0.4 THEN 'Medium'
          ELSE 'Low'
        END`
    ),
    queryRows<RecentIncidentRow>(
      `SELECT id, title, incident_type, status, created_at, reported_at, location_name
       FROM incidents
       ORDER BY COALESCE(created_at, reported_at) DESC
       LIMIT 8`
    ),
    queryRows<HotspotRow>(
      `SELECT COALESCE(location_name, 'Nairobi') AS hotspot, CAST(COUNT(*) AS CHAR) AS count
       FROM incidents
       GROUP BY COALESCE(location_name, 'Nairobi')
       ORDER BY COUNT(*) DESC
       LIMIT 5`
    ),
  ]);
  return [
    users,
    incidents,
    alerts,
    byStatus,
    byType,
    byAlertType,
    resolvedRate,
    incidentTrend,
    alertTrend,
    userRoles,
    incidentsBySource,
    incidentsByHour,
    streetLightHealth,
    riskBands,
    recentReports,
    hotspots,
  ] as const;
};

const buildDashboard = (
  users: CountRow[],
  incidents: CountRow[],
  alerts: CountRow[],
  byStatus: StatusRow[],
  byType: TypeRow[],
  byAlertType: AlertRow[],
  resolvedRate: Array<{ resolved: string; total: string }>,
  incidentTrend: DayRow[],
  alertTrend: DayRow[],
  userRoles: RoleRow[],
  incidentsBySource: SourceRow[],
  incidentsByHour: HourRow[],
  streetLightHealth: StreetLightRow[],
  riskBands: RiskBandRow[],
  recentReports: RecentIncidentRow[],
  hotspots: HotspotRow[]
) => {
  const resolved = Number(resolvedRate[0]?.resolved ?? 0);
  const total = Number(resolvedRate[0]?.total ?? 0);
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  return {
    users: Number(users[0]?.count ?? 0),
    incidents: Number(incidents[0]?.count ?? 0),
    activeAlerts: Number(alerts[0]?.count ?? 0),
    incidentsBySeverity: byStatus.map((r) => ({
      severity: r.status === "resolved" ? "low" : "medium",
      count: Number(r.count),
    })),
    incidentsByType: byType.map((r) => ({ type: r.incident_type, count: Number(r.count) })),
    alertsByType: byAlertType.map((r) => ({ type: r.alert_type, count: Number(r.count) })),
    userRoles: userRoles.map((row) => ({ role: row.role, count: Number(row.count) })),
    incidentsBySource: incidentsBySource.map((row) => ({ source: row.source, count: Number(row.count) })),
    incidentsByHour: incidentsByHour.map((row) => ({ hour: row.hour_bucket, count: Number(row.count) })),
    streetLightHealth: streetLightHealth.map((row) => ({ status: row.status, count: Number(row.count) })),
    riskBands: riskBands.map((row) => ({ band: row.band, count: Number(row.count) })),
    resolutionRate,
    recentReports: recentReports.map((row) => ({
      id: row.id,
      title: row.title ?? row.incident_type,
      type: row.incident_type,
      status: row.status,
      date: row.created_at ?? row.reported_at,
      locationName: row.location_name ?? "Nairobi",
    })),
    hotspots: hotspots.map((row) => ({ name: row.hotspot, count: Number(row.count) })),
    trends: {
      incidents: incidentTrend.map((row) => ({ day: row.day, count: Number(row.count) })),
      alerts: alertTrend.map((row) => ({ day: row.day, count: Number(row.count) })),
    },
  };
};

export const reportsService = {
  async dashboard() {
    const data = await buildDashboardPayload();
    return buildDashboard(...data);
  },

  async exportReport() {
    const data = await buildDashboardPayload();
    const dashboard = buildDashboard(...data);
    return {
      generatedAt: new Date().toISOString(),
      system: "LINDAMWANANCHI SAFETY NAVIGATION SYSTEM",
      summary: dashboard,
    };
  },
};
