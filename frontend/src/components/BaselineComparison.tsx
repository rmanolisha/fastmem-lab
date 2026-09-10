import "./panel.css";
import type { CompareResponse } from "../types/api";

interface BaselineComparisonProps {
  result: CompareResponse | null;
  loading?: boolean;
}

function finalProbeSimilarities(res: CompareResponse["fast_weight"]) {
  const probeIds = Array.from(new Set(res.points.map((p) => p.probe_id)));
  const maxStep = Math.max(...res.points.map((p) => p.step));
  return probeIds.map((pid) => {
    const pt = res.points.filter((p) => p.probe_id === pid && p.step === maxStep)[0];
    return { pid, similarity: pt?.similarity ?? NaN, error: pt?.error ?? NaN };
  });
}

export function BaselineComparison({ result, loading }: BaselineComparisonProps) {
  if (loading) {
    return (
      <div className="panel">
        <div className="panel-title">Baseline: fast weight vs. nearest neighbor</div>
        <p className="loading-text">Running both methods on the live backend\u2026</p>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="panel">
        <div className="panel-title">Baseline: fast weight vs. nearest neighbor</div>
        <p className="loading-text">Run the comparison to see real results here.</p>
      </div>
    );
  }

  const fw = finalProbeSimilarities(result.fast_weight);
  const nn = finalProbeSimilarities(result.nearest_neighbor);

  return (
    <div className="panel">
      <div className="panel-title">Baseline: fast weight vs. nearest neighbor</div>
      <div className="panel-sub">
        Same associations, same probes, same seed ({result.fast_weight.seed}) \u2014 final-step
        probe retrieval quality after all {result.fast_weight.num_associations} associations are
        written.
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>probe</th>
            <th>fast weight \u2014 similarity</th>
            <th>fast weight \u2014 error</th>
            <th>nearest neighbor \u2014 similarity</th>
            <th>nearest neighbor \u2014 error</th>
          </tr>
        </thead>
        <tbody>
          {fw.map((row, i) => (
            <tr key={row.pid}>
              <td>#{row.pid}</td>
              <td style={{ color: row.similarity > 0.85 ? "var(--live)" : row.similarity > 0.5 ? "var(--warn)" : "var(--bad)" }}>
                {row.similarity.toFixed(3)}
              </td>
              <td>{row.error.toFixed(3)}</td>
              <td style={{ color: "var(--live)" }}>{nn[i]?.similarity.toFixed(3)}</td>
              <td>{nn[i]?.error.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">
        Nearest neighbor stores every association explicitly, so it is expected to keep near-exact
        recall regardless of how many associations are written -- at the cost of unbounded memory.
        Fast weight compresses everything into a fixed d&times;d matrix, so its retrieval quality is
        expected to degrade as associations accumulate. Neither is "better" in general: they
        represent different memory mechanisms with different storage/accuracy trade-offs, and fast
        weight's degradation under key noise (see the noise experiment) is not necessarily worse
        than nearest neighbor's brittleness when two stored keys are highly similar.
      </p>
    </div>
  );
}
