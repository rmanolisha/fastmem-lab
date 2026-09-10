import { StationHeader, MetricCard, MetricRow } from "../components/layout/StationHeader";
import { ProvenanceSection, LimitationsSection } from "../components/StaticSections";
import "../components/panel.css";

interface LimitationsProps {
  testsPassing: number;
  testsTotal: number;
}

export function Limitations({ testsPassing, testsTotal }: LimitationsProps) {
  return (
    <div className="station-body">
      <StationHeader
        stationLabel="STATION 08 // VERIFIED RIGOR SPEC"
        title="System Limitations & Computational Provenance"
        subtitle="Explicit boundaries and honest classification. Every claim distinguishes live-computed state from synthetic or analytical content -- nothing here is fabricated to look more impressive than it is."
      />

      <MetricRow>
        <MetricCard label="Backend tests passing" value={`${testsPassing}/${testsTotal}`} tone="accent" />
        <MetricCard label="Precomputed results used" value="0" tone="accent" sub="nothing in this app is precomputed" />
        <MetricCard label="External embedding APIs called" value="0" sub="text-to-vector mode is local & deterministic" />
        <MetricCard label="Write rule variant" value="Additive Hebbian" sub="not the delta-rule -- see limitations" />
      </MetricRow>

      <ProvenanceSection />
      <LimitationsSection />
    </div>
  );
}
