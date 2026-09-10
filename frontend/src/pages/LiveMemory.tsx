import { StationHeader, MetricCard, MetricRow } from "../components/layout/StationHeader";
import { MatrixViewer } from "../components/MatrixViewer";
import { AssociationBuilder } from "../components/AssociationBuilder";
import "../components/panel.css";
import type { StateResponse } from "../types/api";

interface LiveMemoryProps {
  dimension: number;
  learningRate: number;
  seed: number;
  matrix: number[][];
  changedCells: [number, number][];
  state: StateResponse | null;
  error: string | null;
  busy: boolean;
  sessionId: string | null;
  onWrite: (key: number[], value: number[], label?: string) => void;
  onAutoGenerate: () => void;
  onReset: () => void;
}

export function LiveMemory({
  dimension, learningRate, seed, matrix, changedCells, state, error, busy, sessionId,
  onWrite, onAutoGenerate, onReset,
}: LiveMemoryProps) {
  return (
    <div className="station-body">
      <StationHeader
        stationLabel="STATION 03 // LIVE SYNAPTIC SURFACE"
        title="Associative Fast-Weight Matrix (W)"
        subtitle={`Session created with d=${dimension}, \u03B7=${learningRate}, seed=${seed} via POST /memory/create. Write an association and watch this matrix actually change.`}
      />

      <MetricRow>
        <MetricCard label="Frobenius norm ||W||" value={state ? state.frobenius_norm.toFixed(4) : "\u2014"} tone="accent" />
        <MetricCard label="Associations written" value={state ? String(state.num_associations) : "0"} />
        <MetricCard label="Dimension" value={`${dimension}\u00D7${dimension}`} />
        <MetricCard label="Learning rate \u03B7" value={learningRate.toFixed(4)} />
      </MetricRow>

      {error && <div className="error-box">{error}</div>}

      <div className="grid-2">
        <AssociationBuilder
          dimension={dimension}
          onSubmit={onWrite}
          onAutoGenerate={onAutoGenerate}
          disabled={busy || !sessionId}
        />
        <div className="panel">
          <div className="panel-title">Session control</div>
          <div className="kv-list">
            <div className="kv-row"><span className="kv-key">session id</span><span className="kv-val">{sessionId?.slice(0, 13) ?? "\u2014"}\u2026</span></div>
            <div className="kv-row"><span className="kv-key">associations</span><span className="kv-val">{state?.num_associations ?? 0}</span></div>
            <div className="kv-row"><span className="kv-key">||W||_F</span><span className="kv-val">{state ? state.frobenius_norm.toFixed(4) : "0.0000"}</span></div>
          </div>
          <div className="btn-row" style={{ marginTop: 14 }}>
            <button onClick={onReset} disabled={busy}>Reset memory</button>
          </div>
          <p className="note">Reset re-zeroes W and clears every stored association for this session (POST /memory/reset).</p>
        </div>
      </div>

      <MatrixViewer matrix={matrix} changedCells={changedCells} />
    </div>
  );
}
