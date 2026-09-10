import { StationHeader, MetricCard, MetricRow } from "../components/layout/StationHeader";
import "../components/panel.css";

export function Mechanism() {
  return (
    <div className="station-body">
      <StationHeader
        stationLabel="STATION 02 // CORE HEBBIAN ARCHITECTURE"
        title="Synaptic Mechanism & Outer-Product Dataflow"
        subtitle="Fast associative memory stores associations without gradient descent. The matrix updates directly via a Hebbian outer-product write."
      />

      <MetricRow>
        <MetricCard label="Key / value dim (d)" value="d" sub="configurable 4 / 8 / 16 / 32" />
        <MetricCard label="Write complexity" value="O(1)" sub="rank-1 outer product" />
        <MetricCard label="Retrieve complexity" value="O(d\u00B2)" sub="matrix-vector product" />
        <MetricCard label="Normalization" value="L2" sub="keys/values normalized by default" />
      </MetricRow>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-icon-title" style={{ marginBottom: 10 }}><span className="sq" />Write</div>
          <div className="equation-block">{`W <- W + \u03B7 (k v\u1D40)`}</div>
          <p className="note">Outer product of key and value, scaled by the learning rate \u03B7, added directly onto the matrix. No loss function, no gradient.</p>
        </div>
        <div className="panel">
          <div className="panel-icon-title" style={{ marginBottom: 10 }}><span className="sq" />Retrieve</div>
          <div className="equation-block">{`v\u0302 = W\u1D40 q`}</div>
          <p className="note">A single matrix-vector product against the query key returns the retrieved value estimate.</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Worked example (also the automated unit test)</div>
        <div className="equation-block">{`k = [1, 0],  v = [0, 1],  \u03B7 = 1

outer(k, v) = [[0, 1],
               [0, 0]]

W after one write = [[0, 1],
                      [0, 0]]

retrieval:  W\u1D40 @ k = [0, 1] = v      \u2713 exact recovery`}</div>
        <span className="tag tag-live">tests/test_fast_weight.py::test_manual_worked_example_no_normalization</span>
      </div>

      <div className="panel">
        <div className="panel-title">A real, tested mathematical subtlety</div>
        <p style={{ fontSize: 12.5 }}>
          For a single stored association, <code>v\u0302 = \u03B7\u27E8k,q\u27E9\u00B7v</code> is always a scalar
          multiple of the stored value. That means cosine similarity to ground truth pins near +1
          regardless of query noise magnitude -- it does not gradually degrade the way you might
          expect. Normalized L2 error is the metric that actually reveals noise degradation in that
          regime. This was caught by a failing test during development, not smoothed over -- see
          Station 04 and <code>research/equations.md</code>.
        </p>
      </div>
    </div>
  );
}
