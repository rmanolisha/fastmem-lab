import "./panel.css";

interface VectorViewerProps {
  label: string;
  vector: number[];
  color?: string;
}

export function VectorViewer({ label, vector, color = "var(--live)" }: VectorViewerProps) {
  const maxAbs = Math.max(1e-9, ...vector.map((v) => Math.abs(v)));
  return (
    <div>
      <div className="readout-row">
        <span className="readout-label">{label}</span>
        <span className="readout-value">dim={vector.length}</span>
      </div>
      <div className="vector-bars">
        {vector.map((v, i) => {
          const heightPct = (Math.abs(v) / maxAbs) * 100;
          return (
            <div className="vector-bar-wrap" key={i} title={`[${i}] = ${v.toFixed(4)}`}>
              <div
                className="vector-bar"
                style={{
                  height: `${Math.max(heightPct, 2)}%`,
                  background: v >= 0 ? color : "var(--bad)",
                  opacity: v >= 0 ? 1 : 0.85,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
