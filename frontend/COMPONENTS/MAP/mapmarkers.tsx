import type { Incident } from "../../TYPES";

export const MapMarkers = ({ incidents }: { incidents: Incident[] }) => {
  return (
    <ul className="lm-marker-list">
      {incidents.map((incident) => (
        <li key={incident.id}>
          <span className={`lm-dot ${incident.severity}`} />
          <p>{incident.locationName}</p>
        </li>
      ))}
    </ul>
  );
};
