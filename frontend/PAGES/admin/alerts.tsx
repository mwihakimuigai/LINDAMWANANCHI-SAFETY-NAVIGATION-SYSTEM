import { useMemo } from "react";
import { useAppContext } from "../../CONTEXT/AppContext";
import { AdminMetricCard, AdminPageHeader } from "../../COMPONENTS/ADMIN/AdminKit";

export default function AdminAlertsPage() {
  const { alerts } = useAppContext();

  const advisory = useMemo(() => alerts.filter((alert) => alert.level === "advisory").length, [alerts]);
  const warning = useMemo(() => alerts.filter((alert) => alert.level === "warning").length, [alerts]);
  const critical = useMemo(() => alerts.filter((alert) => alert.level === "critical").length, [alerts]);

  return (
    <main className="lm-dashboard lm-admin-page-wrap">
      <AdminPageHeader
        title="Alert Operations"
        subtitle="Review active safety alerts, severity levels, and recent operational signals."
      />

      <section className="lm-admin-metrics-grid">
        <AdminMetricCard label="All Alerts" value={alerts.length} hint="Current active and advisory alerts" />
        <AdminMetricCard label="Critical" value={critical} hint="Immediate action alerts" tone="danger" />
        <AdminMetricCard label="Warning" value={warning} hint="Needs attention soon" tone="warning" />
        <AdminMetricCard label="Advisory" value={advisory} hint="Low urgency notices" tone="success" />
      </section>

      <section className="lm-admin-dashboard-grid single">
        <section className="lm-panel">
          <div className="lm-admin-panel-head">
            <h3>Live Alert Queue</h3>
          </div>
          <div className="lm-alert-list">
            {alerts.map((alert) => (
              <article key={alert.id} className={`lm-alert lm-${alert.level}`}>
                <strong>{alert.message}</strong>
                <p>{new Date(alert.createdAt).toLocaleString()}</p>
              </article>
            ))}
            {!alerts.length ? <p className="lm-meta">No active alerts at the moment.</p> : null}
          </div>
        </section>
      </section>
    </main>
  );
}
