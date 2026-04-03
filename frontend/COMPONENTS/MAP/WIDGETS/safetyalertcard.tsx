import type { SafetyAlert } from "../../../TYPES";

export const SafetyAlertCard = ({ alert }: { alert: SafetyAlert }) => {
  return (
    <article className={`lm-card lm-alert-card ${alert.level}`}>
      <strong>{alert.level.toUpperCase()}</strong>
      <p>{alert.message}</p>
    </article>
  );
};
