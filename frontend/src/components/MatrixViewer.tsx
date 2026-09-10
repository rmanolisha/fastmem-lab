import "./panel.css";

interface MatrixViewerProps {
  matrix: number[][];
  changedCells?: [number, number][];
  title?: string;
  compactThreshold?: number;
}

function cellColor(v: number, maxAbs: number): string {
  if (maxAbs < 1e-9) return "transparent";
  const t = Math.min(Math.abs(v) / maxAbs, 1);
  const alpha = 0.10 + t * 0.5;
  return v >= 0 ? `rgba(47, 230, 198, ${alpha})` : `rgba(240, 97, 95, ${alpha})`;
}

export function MatrixViewer({ matrix, changedCells = [], title = "Synaptic manifold core", compactThreshold = 16 }: MatrixViewerProps) {
  const dim = matrix.length;
  const changedSet = new Set(changedCells.map(([i, j]) => `${i}-${j}`));
  const maxAbs = Math.max(1e-9, ...matrix.flat().map(Math.abs));
  const compact = dim > compactThreshold;

  return (
    <div className="panel">
      <div className="panel-head-row">
        <span className="panel-icon-title"><span className="sq" />{title}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="tag tag-live">LIVE</span>
          <span className="tag">{dim}&times;{dim}</span>
        </div>
      </div>
      <div className="panel-sub">
        {changedCells.length > 0 ? `${changedCells.length} cells changed by the last write` : "matrix W, current state"}
      </div>
      <div className="matrix-scroll">
        {compact ? (
          <svg width={dim * 14} height={dim * 14} role="img" aria-label={`${dim} by ${dim} matrix heatmap`}>
            {matrix.map((row, i) =>
              row.map((v, j) => (
                <rect
                  key={`${i}-${j}`}
                  x={j * 14} y={i * 14} width={13} height={13}
                  fill={cellColor(v, maxAbs)}
                  stroke={changedSet.has(`${i}-${j}`) ? "var(--live)" : "none"}
                  strokeWidth={changedSet.has(`${i}-${j}`) ? 1 : 0}
                />
              ))
            )}
          </svg>
        ) : (
          <table className="matrix-table">
            <thead>
              <tr>
                <td></td>
                {matrix[0]?.map((_, j) => <td key={j} style={{ color: "var(--ink-faint)", border: "none" }}>k{j}</td>)}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--ink-faint)", border: "none" }}>v{i}</td>
                  {row.map((v, j) => (
                    <td
                      key={j}
                      className={changedSet.has(`${i}-${j}`) ? "changed" : ""}
                      style={{ background: cellColor(v, maxAbs) }}
                      title={`W[${i}][${j}] = ${v.toFixed(4)}`}
                    >
                      {Math.abs(v) < 0.005 ? "\u00B7" : v.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="note">
        Cell color encodes sign and magnitude (teal = positive, coral = negative). Compact mode
        (dimension &gt; {compactThreshold}) renders a heatmap without per-cell numbers so the
        browser stays responsive at larger dimensions.
      </p>
    </div>
  );
}
