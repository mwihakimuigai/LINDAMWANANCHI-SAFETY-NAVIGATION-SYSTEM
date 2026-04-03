import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../CONTEXT/AppContext";
import { mapService, type NairobiLayers } from "../SERVICES/mapService";
import { pipelineService, type PipelineStatus } from "../SERVICES/pipelineService";
import { AdminBarChart, AdminLineChart, AdminPieChart } from "../COMPONENTS/ADMIN/AdminKit";

const NairobiMap = dynamic(() => import("../COMPONENTS/MAP/NairobiMap").then((m) => m.NairobiMap), { ssr: false });

export default function HomePage() {
  const { alerts, incidents, routes, user, userLocation, isLocationApproximate } = useAppContext();
  const [layers, setLayers] = useState<NairobiLayers | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const safest = useMemo(() => routes[0], [routes]);
  const todayCount = useMemo(() => {
    const now = new Date();
    return incidents.filter((incident) => {
      const d = new Date(incident.reportedAt);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }).length;
  }, [incidents]);

  const weekCount = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return incidents.filter((incident) => new Date(incident.reportedAt) >= start).length;
  }, [incidents]);

  const recentIncidents = useMemo(() => incidents.slice(0, 5), [incidents]);
  const severityCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    incidents.forEach((incident) => {
      if (incident.severity === "high") counts.high += 1;
      if (incident.severity === "medium") counts.medium += 1;
      if (incident.severity === "low") counts.low += 1;
    });
    return counts;
  }, [incidents]);

  const sourceCounts = useMemo(() => {
    let news = 0;
    let userReported = 0;
    incidents.forEach((incident) => {
      if (incident.source === "news") news += 1;
      else userReported += 1;
    });
    return { news, userReported };
  }, [incidents]);

  const hourlyPulse = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const slot = new Date(now);
      slot.setHours(now.getHours() - (5 - i));
      slot.setMinutes(0, 0, 0);
      return { label: `${slot.getHours()}:00`, count: 0 };
    });
    incidents.forEach((incident) => {
      const d = new Date(incident.reportedAt);
      const ageHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
      if (ageHours < 0 || ageHours >= 6) return;
      const index = 5 - Math.floor(ageHours);
      if (buckets[index]) buckets[index].count += 1;
    });
    return buckets;
  }, [incidents]);

  const weeklyTrend = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const slot = new Date(today);
      slot.setDate(today.getDate() - (6 - index));
      const label = slot.toLocaleDateString([], { weekday: "short" });
      const count = incidents.filter((incident) => {
        const d = new Date(incident.reportedAt);
        return d.toDateString() === slot.toDateString();
      }).length;
      const alertCount = alerts.filter((alert) => {
        const d = new Date(alert.createdAt);
        return d.toDateString() === slot.toDateString();
      }).length;
      return { label, count, alertCount };
    });
  }, [alerts, incidents]);

  const incidentTypeSplit = useMemo(() => {
    const counts = new Map<string, number>();
    incidents.forEach((incident) => {
      counts.set(incident.type, (counts.get(incident.type) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
  }, [incidents]);

  const severityBarData = useMemo(
    () => [
      { severity: "High", count: severityCounts.high },
      { severity: "Medium", count: severityCounts.medium },
      { severity: "Low", count: severityCounts.low },
    ],
    [severityCounts.high, severityCounts.low, severityCounts.medium]
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      const next = await mapService.getNairobiLayers();
      if (mounted) setLayers(next);
    };
    void load();
    const timer = setInterval(() => {
      void load();
    }, 15000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadStatus = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        const status = await pipelineService.getStatus();
        if (mounted) setPipelineStatus(status);
      } catch {
        if (mounted) setPipelineStatus(null);
      }
    };

    void loadStatus();
    const timer = setInterval(() => {
      void loadStatus();
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <main className="lm-dashboard">
      <header className="lm-header">
        <div>
            <p className="lm-brand">LINDAMWANANCHI SAFETY NAVIGATION SYSTEM</p>
          <h1>Dashboard Summary</h1>
          <p className="lm-meta">Welcome, {user?.displayName ?? "Citizen"}.</p>
        </div>
      </header>

      <section className="lm-admin-kpis">
        <article className="lm-kpi-card lm-kpi-danger">
          <span className="lm-kpi-icon">IN</span>
          <h3>Open Incidents</h3>
          <p>{incidents.length}</p>
        </article>
        <article className="lm-kpi-card lm-kpi-warning">
          <span className="lm-kpi-icon">AL</span>
          <h3>Active Alerts</h3>
          <p>{alerts.length}</p>
        </article>
        <article className="lm-kpi-card">
          <span className="lm-kpi-icon">TD</span>
          <h3>Today</h3>
          <p>{todayCount}</p>
        </article>
        <article className="lm-kpi-card">
          <span className="lm-kpi-icon">WK</span>
          <h3>This Week</h3>
          <p>{weekCount}</p>
        </article>
        <article className="lm-kpi-card lm-kpi-safe">
          <span className="lm-kpi-icon">RT</span>
          <h3>Safest Route</h3>
          <p>{safest?.riskScore ?? 0}%</p>
        </article>
      </section>

      <section className="lm-grid">
        <section className="lm-panel">
          <h2>Quick Actions</h2>
          <div className="lm-feature-icons">
            <Link href="/map" className="lm-feature-card"><span className="lm-feature-icon">MAP</span><strong>Open Map</strong></Link>
            <Link href="/alerts" className="lm-feature-card"><span className="lm-feature-icon">AL</span><strong>View Alerts</strong></Link>
            <Link href="/sos" className="lm-feature-card"><span className="lm-feature-icon">SOS</span><strong>SOS</strong></Link>
            <Link href="/reports" className="lm-feature-card"><span className="lm-feature-icon">RI</span><strong>Report</strong></Link>
            <Link href="/guide" className="lm-feature-card"><span className="lm-feature-icon">GD</span><strong>Guide</strong></Link>
          </div>
          <p className="lm-meta">
            GPS {isLocationApproximate ? "Approx" : "Live"}: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        </section>

        <section className="lm-panel">
          <h2>Map Preview</h2>
          <div className="lm-map-preview">
            <NairobiMap layers={layers} showControls={false} />
          </div>
          <p className="lm-meta">This is preview only. Go to Map tab for full interactive routing.</p>
        </section>

        <section className="lm-panel">
          <h2>Recent Incidents</h2>
          {recentIncidents.length === 0 ? <p className="lm-meta">No incidents yet.</p> : null}
          <div className="lm-alert-list">
            {recentIncidents.map((incident) => (
              <article key={incident.id} className="lm-alert-item">
                <strong>{incident.title}</strong>
                <p>{incident.locationName} - {incident.type}</p>
                <time>{new Date(incident.reportedAt).toLocaleString()}</time>
              </article>
            ))}
          </div>
        </section>

        <section className="lm-analytics-grid">
          <AdminLineChart
            title="Safety Activity Trend"
            series={[
              { name: "Incidents", color: "#6ea8ff", points: weeklyTrend.map((item) => ({ label: item.label, count: item.count })) },
              { name: "Alerts", color: "#ff7a7a", points: weeklyTrend.map((item) => ({ label: item.label, count: item.alertCount })) },
            ]}
          />
          <AdminPieChart title="Incident Type Distribution" items={incidentTypeSplit} labelKey="type" valueKey="count" />
          <AdminBarChart title="Severity Distribution" items={severityBarData} labelKey="severity" valueKey="count" tone="#ff9f43" />
          <AdminBarChart title="Incident Pulse (6h)" items={hourlyPulse} labelKey="label" valueKey="count" tone="#22c55e" />
          <AdminPieChart title="Source Split" items={[{ source: "News Feed", count: sourceCounts.news }, { source: "User Reports", count: sourceCounts.userReported }]} labelKey="source" valueKey="count" />
          <article className="lm-panel">
            <div className="lm-admin-panel-head">
              <h3>Live Analytics Notes</h3>
            </div>
            <div className="lm-admin-pill-grid">
              <div className="lm-admin-pill-card">
                <span>Pipeline status</span>
                <strong>{pipelineStatus?.active ? "Running" : "Offline"}</strong>
              </div>
              <div className="lm-admin-pill-card">
                <span>Last ingestion</span>
                <strong>{pipelineStatus?.lastRun?.at ? new Date(pipelineStatus.lastRun.at).toLocaleTimeString() : "n/a"}</strong>
              </div>
              <div className="lm-admin-pill-card">
                <span>Open incidents</span>
                <strong>{incidents.length}</strong>
              </div>
              <div className="lm-admin-pill-card">
                <span>Alerts tracked</span>
                <strong>{alerts.length}</strong>
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
