import type { ReactNode } from "react";

type AnalyticsCardProps = {
  title: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
};

export const AnalyticsCard = ({ title, value, helper, icon }: AnalyticsCardProps) => {
  return (
    <div className="lm-card lm-analytics-card">
      <div className="lm-analytics-head">
        <p>{title}</p>
        {icon}
      </div>
      <h3>{value}</h3>
      {helper ? <span>{helper}</span> : null}
    </div>
  );
};
