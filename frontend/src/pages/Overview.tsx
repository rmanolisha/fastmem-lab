import { StationHeader, MetricCard, MetricRow } from "../components/layout/StationHeader";
import "../components/panel.css";

interface OverviewProps {
  testsPassing: number;
  testsTotal: number;
}

export function Overview({ testsPassing, testsTotal }: OverviewProps) {
  return (
    <div className="station-body">
      <StationHeader
        stationLabel="STATION 01 // OVERVIEW & CLAIM"
        title="Fast-Weight Synaptic Binding Hypothesis"
        subtitle="A non-recurrent associative matrix updated by a Hebbian outer-product rule -- no gradient descent, no backward pass -- tested here for storage, retrieval, and interference behavior."
      />

      <MetricRow>
        <MetricCard label="Write rule" value="O(1)" sub="rank-1 outer-product update" />
        <MetricCard label="Retrieve rule" value="O(1)" sub="matrix-vector product" />
        <MetricCard label="Backend tests" value={`${testsPassing}/${testsTotal}`} tone="accent" sub="pytest, last verified run" />
        <MetricCard label="Gradient descent used" value="NONE" tone="warn" sub="by design -- see Mechanism" />
      </MetricRow>

      <div className="panel">
        <div className="panel-icon-title" style={{ marginBottom: 10 }}><span className="sq" />The claim under test</div>
        <div className="equation-block" style={{ color: "var(--ink)", whiteSpace: "pre-wrap" }}>
          "A fast-weight matrix can store and retrieve associations without gradient descent, but
          capacity is bounded and new writes interfere with old ones."
        </div>
        <p className="note">
          This is falsifiable, and the rest of this app is built to let you falsify or confirm it
          yourself -- write associations on Station 03, query them on Station 04, and watch capacity
          and interference play out live on Stations 05-06.
        </p>
      </div>

      <div className="grid-3">
        <div className="panel">
          <div className="panel-title">Claim A</div>
          <p style={{ fontSize: 12.5 }}>Writing and retrieving one association is O(1) and does not require iterative optimization.</p>
          <span className="tag tag-live">verified by tests/test_fast_weight.py</span>
        </div>
        <div className="panel">
          <div className="panel-title">Claim B</div>
          <p style={{ fontSize: 12.5 }}>Retrieval quality for early associations degrades as more are written into the same fixed-size matrix.</p>
          <span className="tag tag-live">verified by Station 05 interference sweep</span>
        </div>
        <div className="panel">
          <div className="panel-title">Claim C</div>
          <p style={{ fontSize: 12.5 }}>A larger memory dimension sustains more associations before that degradation sets in.</p>
          <span className="tag tag-live">verified by Station 05 dimension sweep</span>
        </div>
      </div>
    </div>
  );
}
