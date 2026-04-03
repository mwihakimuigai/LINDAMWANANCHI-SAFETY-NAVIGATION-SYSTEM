import type { Incident } from "../../TYPES";

type IncidentModalProps = {
  incident?: Incident;
  onClose: () => void;
};

export const IncidentModal = ({ incident, onClose }: IncidentModalProps) => {
  if (!incident) return null;

  return (
    <div className="lm-modal-overlay" onClick={onClose}>
      <div
        className="lm-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>{incident.title}</h3>
        <p>
          <strong>Location:</strong> {incident.locationName}
        </p>
        <p>
          <strong>Type:</strong> {incident.type}
        </p>
        <p>
          <strong>Severity:</strong> {incident.severity}
        </p>
        <p>
          <strong>Verified:</strong> {incident.verified ? "Yes" : "Pending"}
        </p>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
