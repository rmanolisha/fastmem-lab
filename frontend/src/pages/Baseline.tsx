import { StationHeader, MetricCard, MetricRow } from "../components/layout/StationHeader";
import { BaselineComparison } from "../components/BaselineComparison";
import "../components/panel.css";
import type { CompareResponse } from "../types/api";

interface BaselineProps {
  result: CompareResponse | null;
  loading: boolean;
  onRun: () => void;
}

export function Baseline({ result, loading, onRun }: BaselineProps) {
  return (
    <div className="station-body">
      <StationHeader
        stationLabel="STATION 06 // BASELINE COMPARISON"
        title="Fast Weight vs. Nearest Neighbor"
        subtitle="Same associations, same probes, same seed -- compare a fixed-size fast-weight matrix against an associative memory that stores every pair explicitly."
        actions={<button className="primary" onClick={onRun} disabled={loading}>Run comparison</button>}
      />

      <div className="grid-2" style={{ marginBottom: 4 }}>
        <div className="panel">
          <div className="panel-title">Fast-weight memory</div>
          <div className="kv-list">
            <div className="kv-row"><span className="kv-key">storage</span><span className="kv-val">fixed d\u00D7d matrix</span></div>
            <div className="kv-row"><span className="kv-key">write complexity</span><span className="kv-val">O(1) outer product</span></div>
            <div className="kv-row"><span className="kv-key">retrieve complexity</span><span className="kv-val">O(d\u00B2)</span></div>
            <div className="kv-row"><span className="kv-key">failure mode</span><span className="kv-val">graceful interference</span></div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">Nearest-neighbor baseline</div>
          <div className="kv-list">
            <div className="kv-row"><span className="kv-key">storage</span><span className="kv-val">O(n), every pair kept</span></div>
            <div className="kv-row"><span className="kv-key">write complexity</span><span className="kv-val">O(1) append</span></div>
            <div className="kv-row"><span className="kv-key">retrieve complexity</span><span className="kv-val">O(n\u00B7d) cosine scan</span></div>
            <div className="kv-row"><span className="kv-key">failure mode</span><span className="kv-val">brittleness under key similarity</span></div>
          </div>
        </div>
      </div>

      <MetricRow>
        <MetricCard label="Fast weight final similarity" value={result ? [...result.fast_weight.points].filter(p=>p.probe_id===0).sort((a,b)=>a.step-b.step).at(-1)?.similarity.toFixed(3) ?? "\u2014" : "\u2014"} tone="warn" />
        <MetricCard label="Nearest neighbor final similarity" value={result ? [...result.nearest_neighbor.points].filter(p=>p.probe_id===0).sort((a,b)=>a.step-b.step).at(-1)?.similarity.toFixed(3) ?? "\u2014" : "\u2014"} tone="accent" />
      </MetricRow>

      <BaselineComparison result={result} loading={loading} />
    </div>
  );
}
