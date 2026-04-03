import { useAdminData } from "../../HOOKS/useAdminData";
import {
  AdminBarChart,
  AdminHorizontalBars,
  AdminLineChart,
  AdminMetricCard,
  AdminPageHeader,
  AdminPieChart,
} from "../../COMPONENTS/ADMIN/AdminKit";

export default function AdminAnalyticsPage() {
  const { analytics, loading, error } = useAdminData();

  if (loading) {
    return <main className="lm-dashboard"><section className="lm-panel"><p className="lm-meta">Loading analytics...</p></section></main>;
  }

  return (
    <main className="lm-dashboard lm-admin-page-wrap">
      <AdminPageHeader
        title="Analytics And Visualisation"
        subtitle={error || "A richer analytical view built from incidents, alerts, street lights, risk scoring, and account activity."}
      />

      <section className="lm-admin-metrics-grid">
        <AdminMetricCard label="Incident Types" value={analytics?.incidentsByType?.length ?? 0} hint="Categories currently tracked" />
        <AdminMetricCard label="Alert Types" value={analytics?.alertsByType?.length ?? 0} hint="Alert channels detected" tone="warning" />
        <AdminMetricCard label="Risk Bands" value={analytics?.riskBands?.length ?? 0} hint="AI risk distribution levels" tone="danger" />
        <AdminMetricCard label="Street Light States" value={analytics?.streetLightHealth?.length ?? 0} hint="Lighting conditions monitored" tone="success" />
      </section>

      <section className="lm-admin-dashboard-grid">
        <AdminLineChart
          title="Weekly Incident Vs Alert Movement"
          series={[
            { name: "Incidents", color: "#6ea8ff", points: analytics?.trends?.incidents ?? [] },
            { name: "Alerts", color: "#ff7a7a", points: analytics?.trends?.alerts ?? [] },
          ]}
        />
        <AdminPieChart title="Incidents By Type" items={analytics?.incidentsByType ?? []} labelKey="type" valueKey="count" />
        <AdminPieChart title="Incidents By Source" items={analytics?.incidentsBySource ?? []} labelKey="source" valueKey="count" />
        <AdminPieChart title="Alert Types" items={analytics?.alertsByType ?? []} labelKey="type" valueKey="count" />
        <AdminBarChart title="Incidents By Hour" items={analytics?.incidentsByHour ?? []} labelKey="hour" valueKey="count" tone="#22c55e" />
        <AdminBarChart title="User Role Split" items={analytics?.userRoles ?? []} labelKey="role" valueKey="count" tone="#8b5cf6" />
        <AdminBarChart title="Severity Spread" items={analytics?.incidentsBySeverity ?? []} labelKey="severity" valueKey="count" tone="#f59e0b" />
        <AdminHorizontalBars title="Hotspot Ranking" items={analytics?.hotspots ?? []} labelKey="name" valueKey="count" />
        <AdminHorizontalBars title="Street Light Health" items={analytics?.streetLightHealth ?? []} labelKey="status" valueKey="count" />
        <AdminHorizontalBars title="AI Risk Bands" items={analytics?.riskBands ?? []} labelKey="band" valueKey="count" />
      </section>
    </main>
  );
}
