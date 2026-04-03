import { AdminMetricCard, AdminPageHeader } from "../../COMPONENTS/ADMIN/AdminKit";
import { useAdminData } from "../../HOOKS/useAdminData";

export default function AdminSettingsPage() {
  const { analytics, loading, error } = useAdminData();

  if (loading) {
    return <main className="lm-dashboard"><section className="lm-panel"><p className="lm-meta">Loading settings workspace...</p></section></main>;
  }

  return (
    <main className="lm-dashboard lm-admin-page-wrap">
      <AdminPageHeader
        title="System Settings"
        subtitle={error || "Operational settings, platform posture, and deployment-facing summaries."}
      />

      <section className="lm-admin-metrics-grid">
        <AdminMetricCard label="Platform Status" value="Live" hint="Backend and dashboard are currently active" tone="success" />
        <AdminMetricCard label="Report Export" value="Enabled" hint="Admin export generation is available" />
        <AdminMetricCard label="Live Monitoring" value={`${analytics?.activeAlerts ?? 0} alerts`} hint="Current monitored alerts" tone="warning" />
        <AdminMetricCard label="Safety Data Layers" value={`${analytics?.streetLightHealth?.length ?? 0}`} hint="Lighting and risk layers contributing to insights" tone="danger" />
      </section>

      <section className="lm-admin-dashboard-grid single">
        <section className="lm-panel">
          <div className="lm-admin-panel-head">
            <h3>Operational Configuration Summary</h3>
          </div>
          <div className="lm-admin-settings-grid">
            <div className="lm-admin-setting-card">
              <span>Crime ingestion cadence</span>
              <strong>Every 5 minutes</strong>
            </div>
            <div className="lm-admin-setting-card">
              <span>Authentication mode</span>
              <strong>Role-based access control</strong>
            </div>
            <div className="lm-admin-setting-card">
              <span>Report generation</span>
              <strong>JSON and CSV exports</strong>
            </div>
            <div className="lm-admin-setting-card">
              <span>Route safety inputs</span>
              <strong>Incidents, accidents, lighting, drainage, AI risk</strong>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
