import type { Incident } from "../../../TYPES";

type IncidentReportCardProps = {
  incident: Incident;
  onView: (incident: Incident) => void;
};

export const IncidentReportCard = ({ incident, onView }: IncidentReportCardProps) => {
  return (
    <article className="lm-card lm-incident-card">
      <div>
        <h4>{incident.title}</h4>
        <small>{incident.locationName}</small>
      </div>
      <span className={`lm-pill ${incident.severity}`}>{incident.severity}</span>
      <button type="button" onClick={() => onView(incident)}>
        View Details
      </button>
    </article>
  );
};
