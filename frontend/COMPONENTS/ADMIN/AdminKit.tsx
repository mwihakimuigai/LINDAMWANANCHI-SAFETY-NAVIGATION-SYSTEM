import type { ReactNode } from "react";

export const AdminPageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) => (
  <header className="lm-admin-page-header">
    <div>
      <p className="lm-admin-eyebrow">Administrative Control Center</p>
      <h1>{title}</h1>
      <p className="lm-meta">{subtitle}</p>
    </div>
    {actions ? <div className="lm-admin-header-actions">{actions}</div> : null}
  </header>
);

export const AdminMetricCard = ({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: "default" | "danger" | "warning" | "success";
}) => (
  <article className={`lm-admin-metric-card ${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{hint}</small>
  </article>
);

export const AdminLineChart = ({
  title,
  series,
}: {
  title: string;
  series: Array<{ name: string; color: string; points: Array<{ label?: string; day?: string; count: number }> }>;
}) => {
  const maxValue = Math.max(1, ...series.flatMap((item) => item.points.map((point) => point.count)));
  const labels = series[0]?.points.map((point) => point.label ?? point.day ?? "") ?? [];

  const buildArea = (points: Array<{ label?: string; day?: string; count: number }>) => {
    const coordinates = points.map((point, index, arr) => {
      const x = 58 + index * (520 / Math.max(1, arr.length - 1));
      const y = 214 - (point.count / maxValue) * 144;
      return `${x},${y}`;
    });
    return `58,214 ${coordinates.join(" ")} ${58 + (Math.max(1, points.length - 1)) * (520 / Math.max(1, points.length - 1))},214`;
  };

  return (
    <article className="lm-panel lm-admin-chart-panel">
      <div className="lm-admin-panel-head">
        <h3>{title}</h3>
      </div>
      <svg viewBox="0 0 640 260" className="lm-admin-svg">
        <defs>
          {series.map((item, index) => (
            <linearGradient key={item.name} id={`lmArea${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={item.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        <rect x="0" y="0" width="640" height="260" rx="20" fill="rgba(16,24,42,0.74)" />
        {[0, 1, 2, 3].map((index) => (
          <line
            key={index}
            x1="48"
            y1={58 + index * 44}
            x2="602"
            y2={58 + index * 44}
            stroke="rgba(130,152,194,0.18)"
            strokeWidth="1"
          />
        ))}
        {series.map((item, index) => (
          item.points.length > 1 ? (
            <polygon
              key={`${item.name}-area`}
              points={buildArea(item.points)}
              fill={`url(#lmArea${index})`}
            />
          ) : null
        ))}
        {series.map((item) =>
          item.points.map((point, index, arr) => {
            if (index === 0) return null;
            const prev = arr[index - 1];
            const x1 = 58 + (index - 1) * (520 / Math.max(1, arr.length - 1));
            const y1 = 214 - (prev.count / maxValue) * 144;
            const x2 = 58 + index * (520 / Math.max(1, arr.length - 1));
            const y2 = 214 - (point.count / maxValue) * 144;
            return <line key={`${item.name}-${point.label}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={item.color} strokeWidth="4" strokeLinecap="round" />;
          })
        )}
        {series.map((item) =>
          item.points.map((point, index, arr) => {
            const x = 58 + index * (520 / Math.max(1, arr.length - 1));
            const y = 214 - (point.count / maxValue) * 144;
            return (
              <g key={`${item.name}-dot-${index}`}>
                <circle cx={x} cy={y} r="5.5" fill="#0b1324" stroke={item.color} strokeWidth="3" />
                <circle cx={x} cy={y} r="2.2" fill={item.color} />
              </g>
            );
          })
        )}
        {labels.map((label, index) => (
          <text key={label} x={58 + index * (520 / Math.max(1, labels.length - 1))} y="240" fill="#cfe1ff" fontSize="12" textAnchor="middle">
            {label}
          </text>
        ))}
        {[0, 1, 2, 3].map((index) => {
          const value = Math.round((maxValue / 4) * (4 - index));
          return (
            <text key={`scale-${index}`} x="18" y={62 + index * 44} fill="#7f99c5" fontSize="11">
              {value}
            </text>
          );
        })}
      </svg>
      <div className="lm-admin-legend">
        {series.map((item) => (
          <span key={item.name}>
            <i style={{ background: item.color }} />
            {item.name}
          </span>
        ))}
      </div>
    </article>
  );
};

export const AdminBarChart = ({
  title,
  items,
  valueKey,
  labelKey,
  tone = "#5ea8ff",
}: {
  title: string;
  items: Array<Record<string, string | number>>;
  valueKey: string;
  labelKey: string;
  tone?: string;
}) => {
  const maxValue = Math.max(1, ...items.map((item) => Number(item[valueKey] ?? 0)));

  return (
    <article className="lm-panel lm-admin-bar-panel">
      <div className="lm-admin-panel-head">
        <h3>{title}</h3>
      </div>
      <div className="lm-admin-bars-vertical">
        {items.map((item) => (
          <div key={String(item[labelKey])} className="lm-admin-bars-vertical-item">
            <div className="lm-admin-bars-vertical-track">
              <div style={{ height: `${(Number(item[valueKey] ?? 0) / maxValue) * 100}%`, background: `linear-gradient(180deg, ${tone}, rgba(255,255,255,0.08))` }} />
            </div>
            <strong>{String(item[valueKey])}</strong>
            <span>{String(item[labelKey])}</span>
          </div>
        ))}
      </div>
    </article>
  );
};

export const AdminPieChart = ({
  title,
  items,
  labelKey,
  valueKey,
}: {
  title: string;
  items: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
}) => {
  const total = items.reduce((sum, item) => sum + Number(item[valueKey] ?? 0), 0) || 1;
  const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#22c55e", "#8b5cf6", "#ec4899"];
  let offset = 0;

  return (
    <article className="lm-panel lm-admin-donut-panel">
      <div className="lm-admin-panel-head">
        <h3>{title}</h3>
      </div>
      <div className="lm-admin-donut-layout">
        <svg viewBox="0 0 260 260" className="lm-admin-donut-svg">
          <circle cx="130" cy="130" r="86" fill="rgba(120,144,190,0.08)" />
          {items.map((item, index) => {
            const angle = (Number(item[valueKey] ?? 0) / total) * Math.PI * 2;
            const start = offset;
            const end = offset + angle;
            offset = end;
            const x1 = 130 + Math.cos(start - Math.PI / 2) * 86;
            const y1 = 130 + Math.sin(start - Math.PI / 2) * 86;
            const x2 = 130 + Math.cos(end - Math.PI / 2) * 86;
            const y2 = 130 + Math.sin(end - Math.PI / 2) * 86;
            const largeArc = angle > Math.PI ? 1 : 0;
            return (
              <path
                key={String(item[labelKey])}
                d={`M 130 130 L ${x1} ${y1} A 86 86 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length]}
                strokeWidth="1"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="130" cy="130" r="34" fill="rgba(13,19,33,0.95)" />
          <text x="130" y="126" textAnchor="middle" fill="#f5f9ff" fontSize="15" fontWeight="700">
            {total}
          </text>
          <text x="130" y="144" textAnchor="middle" fill="#93a8ca" fontSize="11">
            total
          </text>
        </svg>
        <div className="lm-admin-legend">
          {items.map((item, index) => (
            <span key={String(item[labelKey])}>
              <i style={{ background: colors[index % colors.length] }} />
              {String(item[labelKey])} {Math.round((Number(item[valueKey] ?? 0) / total) * 100)}%
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export const AdminDonutChart = AdminPieChart;

export const AdminHorizontalBars = ({
  title,
  items,
  labelKey,
  valueKey,
}: {
  title: string;
  items: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
}) => {
  const maxValue = Math.max(1, ...items.map((item) => Number(item[valueKey] ?? 0)));

  return (
    <article className="lm-panel">
      <div className="lm-admin-panel-head">
        <h3>{title}</h3>
      </div>
      <div className="lm-admin-horizontal-bars">
        {items.map((item) => (
          <div key={String(item[labelKey])}>
            <div className="lm-admin-horizontal-bars-label">
              <span>{String(item[labelKey])}</span>
              <strong>{String(item[valueKey])}</strong>
            </div>
            <div className="lm-admin-horizontal-bars-track">
              <div style={{ width: `${(Number(item[valueKey] ?? 0) / maxValue) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};

export const AdminTable = ({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: Array<Array<ReactNode>>;
}) => (
  <article className="lm-panel">
    <div className="lm-admin-panel-head">
      <h3>{title}</h3>
    </div>
    <div className="lm-admin-grid-table">
      <div className="lm-admin-grid-table-head">
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      {rows.map((row, index) => (
        <div key={index} className="lm-admin-grid-table-row">
          {row.map((cell, cellIndex) => (
            <span key={`${index}-${cellIndex}`}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  </article>
);
