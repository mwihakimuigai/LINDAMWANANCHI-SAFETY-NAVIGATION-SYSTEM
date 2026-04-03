import type { Incident, SafeRoute, SafetyAlert } from "../../../TYPES";
import { IncidentReportCard } from "../WIDGETS/IncidentReportCard";
import { SafeRouteCard } from "../WIDGETS/saferoutecard";
import { SafetyAlertCard } from "../WIDGETS/safetyalertcard";

type SidebarProps = {
  routes: SafeRoute[];
  incidents: Incident[];
  alerts: SafetyAlert[];
  selectedRouteId?: string;
  onSelectRoute: (routeId: string) => void;
  onViewIncident: (incident: Incident) => void;
};

export const Sidebar = ({
  routes,
  incidents,
  alerts,
  selectedRouteId,
  onSelectRoute,
  onViewIncident,
}: SidebarProps) => {
  return (
    <aside className="lm-sidebar">
      <section>
        <h3>Recommended Routes</h3>
        <div className="lm-stack">
          {routes.map((route) => (
            <SafeRouteCard
              key={route.id}
              route={route}
              active={selectedRouteId === route.id}
              onSelect={onSelectRoute}
            />
          ))}
        </div>
      </section>

      <section>
        <h3>Active Alerts</h3>
        <div className="lm-stack">
          {alerts.map((alert) => (
            <SafetyAlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </section>

      <section>
        <h3>Nearby Incidents</h3>
        <div className="lm-stack">
          {incidents.map((incident) => (
            <IncidentReportCard key={incident.id} incident={incident} onView={onViewIncident} />
          ))}
        </div>
      </section>
    </aside>
  );
};
