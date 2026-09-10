import "./panel.css";

export interface ExperimentParams {
  dimension: number;
  learningRate: number;
  numAssociations: number;
  numProbes: number;
  seed: number;
}

interface ExperimentControlsProps {
  params: ExperimentParams;
  onChange: (params: ExperimentParams) => void;
  onRun: () => void;
  onReset: () => void;
  running?: boolean;
}

const DIMENSIONS = [4, 8, 16, 32];

export function ExperimentControls({ params, onChange, onRun, onReset, running }: ExperimentControlsProps) {
  const set = <K extends keyof ExperimentParams>(k: K, v: ExperimentParams[K]) =>
    onChange({ ...params, [k]: v });

  return (
    <div className="panel">
      <div className="panel-title">Experiment controls</div>
      <div className="panel-sub">Every control maps directly to a parameter of the live computation below.</div>
      <div className="control-grid">
        <div className="control-field">
          <label>memory dimension (d) <span className="value">{params.dimension}</span></label>
          <select value={params.dimension} onChange={(e) => set("dimension", parseInt(e.target.value))}>
            {DIMENSIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="control-field">
          <label>learning rate (\u03B7) <span className="value">{params.learningRate.toFixed(2)}</span></label>
          <input type="range" min={0.05} max={2} step={0.05} value={params.learningRate}
                 onChange={(e) => set("learningRate", parseFloat(e.target.value))} />
        </div>
        <div className="control-field">
          <label>associations to write <span className="value">{params.numAssociations}</span></label>
          <input type="range" min={2} max={200} step={1} value={params.numAssociations}
                 onChange={(e) => set("numAssociations", parseInt(e.target.value))} />
        </div>
        <div className="control-field">
          <label>probe memories <span className="value">{params.numProbes}</span></label>
          <input type="range" min={1} max={10} step={1} value={params.numProbes}
                 onChange={(e) => set("numProbes", parseInt(e.target.value))} />
        </div>
        <div className="control-field">
          <label>random seed</label>
          <input type="number" value={params.seed} onChange={(e) => set("seed", parseInt(e.target.value) || 0)} />
        </div>
      </div>
      <div className="btn-row">
        <button className="primary" onClick={onRun} disabled={running}>
          {running ? "Running\u2026" : "Run experiment"}
        </button>
        <button onClick={onReset} disabled={running}>Reset</button>
      </div>
    </div>
  );
}
