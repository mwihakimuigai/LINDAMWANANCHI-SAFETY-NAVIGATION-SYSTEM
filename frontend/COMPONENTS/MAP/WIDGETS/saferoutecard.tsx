import type { SafeRoute } from "../../../TYPES";

type SafeRouteCardProps = {
  route: SafeRoute;
  active: boolean;
  onSelect: (id: string) => void;
};

export const SafeRouteCard = ({ route, active, onSelect }: SafeRouteCardProps) => {
  return (
    <button
      className={`lm-card lm-route-card ${active ? "active" : ""}`}
      onClick={() => onSelect(route.id)}
      type="button"
    >
      <div className="lm-route-head">
        <h4>{route.name}</h4>
        <span className="lm-risk">{route.riskScore}% risk</span>
      </div>
      <p>
        {route.distanceKm} km · {route.etaMinutes} min
      </p>
      <small>{route.keyLandmarks.join(" • ")}</small>
    </button>
  );
};
