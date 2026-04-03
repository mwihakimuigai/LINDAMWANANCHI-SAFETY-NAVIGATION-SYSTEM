import { useAppContext } from "../CONTEXT/AppContext";

export default function AlertsPage() {
  const { alerts, incidents } = useAppContext();

  return (
    <main className="lm-dashboard">
      <section className="lm-panel">
        <h1>Safety Alerts</h1>
        <p className="lm-meta">Live safety notifications and high-risk incident activity.</p>
        <div className="lm-alert-list">
          {alerts.map((alert) => (
            <article key={alert.id} className={`lm-alert lm-${alert.level}`}>
              <strong>{alert.level.toUpperCase()}</strong>
              <p>{alert.message}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lm-panel">
        <h2>Danger Zone Feed</h2>
        <div className="lm-reports-list">
          {incidents.map((incident) => (
            <article key={incident.id}>
              <strong>{incident.title}</strong>
              <span>{incident.locationName}</span>
              <small>{incident.status ?? "pending"}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
