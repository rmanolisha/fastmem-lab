import "./layout.css";

interface TopBarProps {
  apiUp: boolean | null;
  dimension: number;
  numAssociations: number;
  latencyMs: number | null;
  mode: string;
}

// Hopfield-style capacity heuristic C ~= 0.14 * d (Hopfield, 1982; cited in
// research/papers.md context and standard associative-memory literature).
// This is a well-known analytical rule of thumb for a *classical* Hopfield
// network's pattern capacity -- used here only as a labeled reference line,
// not as a measured property of this project's specific fast-weight
// mechanism, which is why it's presented as "(Hopfield heuristic)".
function capacityUtilPct(dimension: number, numAssociations: number): number {
  const capacity = 0.14 * dimension;
  if (capacity <= 0) return 0;
  return Math.min(100, (numAssociations / capacity) * 100);
}

export function TopBar({ apiUp, dimension, numAssociations, latencyMs, mode }: TopBarProps) {
  const util = capacityUtilPct(dimension, numAssociations);
  return (
    <div className="console-topbar">
      <div className="tb-chip">
        <span className={`dot ${apiUp ? "ok" : "down"}`} />
        KERNEL: <strong>{apiUp === null ? "CHECKING" : apiUp ? "ONLINE" : "UNREACHABLE"}</strong>
      </div>
      <div className="tb-chip">DIMENSIONS <strong>{dimension}&times;{dimension} FP64</strong></div>
      <div className="tb-chip">
        CAPACITY UTIL <strong className="accent">{util.toFixed(1)}%</strong>
        <span style={{ color: "var(--ink-faint)" }}>(Hopfield heuristic, 0.14d)</span>
      </div>
      <div className="tb-chip">ASSOCIATIONS <strong>{numAssociations}</strong></div>
      <div className="tb-chip">
        LAST CALL LATENCY <strong className="accent">{latencyMs == null ? "\u2014" : `${latencyMs.toFixed(1)} ms`}</strong>
      </div>
      <div className="tb-spacer" />
      <div className="tb-chip">MODE: <strong>{mode}</strong></div>
      <div className="tb-avatar" aria-hidden="true">\u2699</div>
    </div>
  );
}
