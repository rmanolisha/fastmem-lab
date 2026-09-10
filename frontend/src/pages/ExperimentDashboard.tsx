import { StationHeader, MetricCard, MetricRow } from "../components/layout/StationHeader";
import { ExperimentControls, type ExperimentParams } from "../components/ExperimentControls";
import { ExperimentChart } from "../components/ExperimentChart";
import { NoiseSweepChart } from "../components/NoiseSweepChart";
import "../components/panel.css";
import type { ExperimentResponse, NoiseSweepResponse } from "../types/api";

interface ExperimentDashboardProps {
  params: ExperimentParams;
  onParamsChange: (p: ExperimentParams) => void;
  method: "fast_weight" | "nearest_neighbor";
  onMethodChange: (m: "fast_weight" | "nearest_neighbor") => void;
  expResult: ExperimentResponse | null;
  expLoading: boolean;
  onRun: () => void;
  onReset: () => void;
  noiseResult: NoiseSweepResponse | null;
  noiseLoading: boolean;
  onRunNoise: () => void;
}

export function ExperimentDashboard({
  params, onParamsChange, method, onMethodChange, expResult, expLoading, onRun, onReset,
  noiseResult, noiseLoading, onRunNoise,
}: ExperimentDashboardProps) {
  const lastProbe0 = expResult
    ? [...expResult.points].filter((p) => p.probe_id === 0).sort((a, b) => a.step - b.step).at(-1)
    : null;
  return (
    <div className="station-body">
      <StationHeader
        stationLabel="STATION 05 // EXPERIMENT SWEEP"
        title="Interference & Capacity Experiment Dashboard"
        subtitle="Fix early associations as probes, keep writing into the same fixed-size matrix, and re-query the probes after every write. This is the central experiment behind the claim."
      />

      <MetricRow>
        <MetricCard label="Probe #0 final similarity" value={lastProbe0 ? lastProbe0.similarity.toFixed(3) : "\u2014"} tone="accent" />
        <MetricCard label="Probe #0 final error" value={lastProbe0 ? lastProbe0.error.toFixed(3) : "\u2014"} />
        <MetricCard label="Associations in sweep" value={String(params.numAssociations)} />
        <MetricCard label="Method" value={method} />
      </MetricRow>

      <ExperimentControls params={params} onChange={onParamsChange} onRun={onRun} onReset={onReset} running={expLoading} />

      <div className="btn-row" style={{ marginBottom: 16 }}>
        <button onClick={() => onMethodChange("fast_weight")} className={method === "fast_weight" ? "primary" : ""}>fast_weight</button>
        <button onClick={() => onMethodChange("nearest_neighbor")} className={method === "nearest_neighbor" ? "primary" : ""}>nearest_neighbor</button>
      </div>

      <ExperimentChart result={expResult} loading={expLoading} />

      <div className="panel">
        <div className="panel-title">Query noise sweep</div>
        <div className="panel-sub">Using the parameters above: store one association, query with q = k + noise at increasing noise scale.</div>
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button className="primary" onClick={onRunNoise} disabled={noiseLoading}>Run noise sweep</button>
        </div>
      </div>
      <NoiseSweepChart result={noiseResult} loading={noiseLoading} />
    </div>
  );
}
