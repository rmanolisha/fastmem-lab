import "./layout.css";

export interface Station {
  id: string;
  num: string;
  label: string;
  code: string;
}

export const STATIONS: Station[] = [
  { id: "overview", num: "01", label: "Overview / Claim", code: "NB" },
  { id: "mechanism", num: "02", label: "Mechanism", code: "ARC" },
  { id: "live-memory", num: "03", label: "Live Memory", code: "RT" },
  { id: "retrieval", num: "04", label: "Retrieval Bounds", code: "ERR" },
  { id: "experiment", num: "05", label: "Experiment Dashboard", code: "EXP" },
  { id: "baseline", num: "06", label: "Baseline Comparison", code: "BEN" },
  { id: "theory", num: "07", label: "Theory & Sources", code: "DOC" },
  { id: "limitations", num: "08", label: "Limitations / Provenance", code: "LED" },
];

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
  learningRate: number;
}

export function Sidebar({ active, onSelect, learningRate }: SidebarProps) {
  return (
    <nav className="console-sidebar" aria-label="Station navigation">
      <div className="console-brand">
        <div className="console-brand-mark">≈</div>
        <div>
          <div className="console-brand-name">FASTMEM LAB</div>
          <div className="console-brand-ver">V1.0 · HEBB-ENGINE</div>
        </div>
      </div>
      <div className="console-core-status">
        <span><span className="dot" />ENGINE ONLINE</span>
        <span>NumPy</span>
      </div>
      <div className="console-nav-label">Station directory</div>
      <div className="console-nav">
        {STATIONS.map((s) => (
          <button
            key={s.id}
            className={`console-nav-item ${active === s.id ? "active" : ""}`}
            onClick={() => onSelect(s.id)}
            aria-current={active === s.id ? "page" : undefined}
          >
            <span><span className="num">{s.num}</span>{s.label}</span>
            <span className="code">{s.code}</span>
          </button>
        ))}
      </div>
      <div className="console-bus-stat">
        <div className="row"><span><span className="dot" />BUS STAT</span><span className="val">SESSION LIVE</span></div>
        <div className="row"><span>HEBBIAN LR</span><span className="val">η={learningRate.toFixed(4)}</span></div>
      </div>
    </nav>
  );
}
