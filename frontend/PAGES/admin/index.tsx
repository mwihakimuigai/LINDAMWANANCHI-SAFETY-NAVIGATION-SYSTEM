import { useMemo } from "react";
import { useAppContext } from "../../CONTEXT/AppContext";
import { useAdminData } from "../../HOOKS/useAdminData";
import {
  AdminBarChart,
  AdminLineChart,
  AdminMetricCard,
  AdminPageHeader,
  AdminPieChart,
  AdminTable,
} from "../../COMPONENTS/ADMIN/AdminKit";

export default function AdminDashboardPage() {
  const { alerts } = useAppContext();
  const { analytics, loading, error } = useAdminData();

  const todayReports = analytics?.recentReports?.filter((report) => {
    const reportDate = new Date(report.date);
    const now = new Date();
    return reportDate.toDateString() === now.toDateString();
  }).length ?? 0;

  const hottestZone = useMemo(
    () => analytics?.hotspots?.slice().sort((a, b) => b.count - a.count)[0]?.name ?? "No hotspot yet",
    [analytics]
  );

  if (loading) {
    return <main className="lm-dashboard"><section className="lm-panel"><p className="lm-meta">Loading admin dashboard...</p></section></main>;
  }

  return (
    <main className="lm-dashboard lm-admin-page-wrap">
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle={error || "System overview, trend tracking, and operational insight for LINDAMWANANCHI."}
      />

      <section className="lm-admin-metrics-grid">
        <AdminMetricCard label="Total Users" value={analytics?.users ?? 0} hint="Registered accounts in the platform" />
        <AdminMetricCard label="Open Incidents" value={analytics?.incidents ?? 0} hint="Incidents currently available for monitoring" tone="danger" />
        <AdminMetricCard label="Reports Today" value={todayReports} hint="Fresh reports received today" tone="warning" />
        <AdminMetricCard label="Resolution Rate" value={`${analytics?.resolutionRate ?? 0}%`} hint="Resolved vs total cases" tone="success" />
      </section>

      <section className="lm-admin-dashboard-grid">
        <AdminLineChart
          title="Incident And Alert Trend"
          series={[
            { name: "Incidents", color: "#6ea8ff", points: analytics?.trends?.incidents ?? [] },
            { name: "Alerts", color: "#ff7a7a", points: analytics?.trends?.alerts ?? [] },
          ]}
        />
        <AdminPieChart
          title="Incident Type Mix"
          items={analytics?.incidentsByType ?? []}
          labelKey="type"
          valueKey="count"
        />
        <AdminPieChart
          title="Incident Source Mix"
          items={analytics?.incidentsBySource ?? []}
          labelKey="source"
          valueKey="count"
        />
        <AdminBarChart
          title="Severity Snapshot"
          items={analytics?.incidentsBySeverity ?? []}
          labelKey="severity"
          valueKey="count"
          tone="#ff9f43"
        />
        <AdminBarChart
          title="Alert Category Load"
          items={analytics?.alertsByType ?? []}
          labelKey="type"
          valueKey="count"
          tone="#ef4444"
        />
        <AdminTable
          title="Recent Reports"
          columns={["Date", "Type", "Location", "Status"]}
          rows={(analytics?.recentReports ?? []).slice(0, 6).map((report) => [
            new Date(report.date).toLocaleDateString(),
            report.type,
            report.locationName,
            report.status,
          ])}
        />
        <section className="lm-panel">
          <div className="lm-admin-panel-head">
            <h3>Active Alerts Feed</h3>
          </div>
          <div className="lm-alert-list">
            {alerts.slice(0, 6).map((alert) => (
              <article key={alert.id} className={`lm-alert lm-${alert.level}`}>
                <strong>{alert.message}</strong>
                <p>{new Date(alert.createdAt).toLocaleString()}</p>
              </article>
            ))}
            {!alerts.length ? <p className="lm-meta">No live alerts right now.</p> : null}
          </div>
        </section>
        <section className="lm-panel">
          <div className="lm-admin-panel-head">
            <h3>Hotspot Focus</h3>
          </div>
          <div className="lm-admin-spotlight">
            <strong>{hottestZone}</strong>
            <p className="lm-meta">Highest incident concentration based on currently stored reports and ingested crime data.</p>
          </div>
          <div className="lm-admin-pill-grid">
            {(analytics?.hotspots ?? []).map((spot) => (
              <div key={spot.name} className="lm-admin-pill-card">
                <span>{spot.name}</span>
                <strong>{spot.count}</strong>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
