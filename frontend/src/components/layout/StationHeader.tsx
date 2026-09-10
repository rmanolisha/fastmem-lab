import type { ReactNode } from "react";
import "./layout.css";

interface StationHeaderProps {
  stationLabel: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export function StationHeader({ stationLabel, title, subtitle, actions }: StationHeaderProps) {
  return (
    <>
      <div className="station-eyebrow-row">
        <span className="eyebrow">{stationLabel}</span>
      </div>
      <div className="station-header">
        <div>
          <h1 className="station-title">{title}</h1>
          <p className="station-sub">{subtitle}</p>
        </div>
        {actions && <div className="station-actions">{actions}</div>}
      </div>
    </>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "accent" | "warn" | "bad";
  barPct?: number;
}

export function MetricCard({ label, value, sub, tone = "default", barPct }: MetricCardProps) {
  const toneClass = tone === "accent" ? "accent" : tone === "warn" ? "warn-c" : tone === "bad" ? "bad-c" : "";
  return (
    <div className="metric-card">
      <div className="m-label">{label}</div>
      <div className={`m-value ${toneClass}`}>{value}</div>
      {sub && <div className="m-sub">{sub}</div>}
      {barPct !== undefined && (
        <div className="m-bar"><div className="m-bar-fill" style={{ width: `${Math.min(100, Math.max(0, barPct))}%` }} /></div>
      )}
    </div>
  );
}

export function MetricRow({ children }: { children: ReactNode }) {
  return <div className="metric-row">{children}</div>;
}
