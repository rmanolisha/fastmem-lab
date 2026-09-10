import "./panel.css";
import { VectorViewer } from "./VectorViewer";
import type { QueryResponse } from "../types/api";

interface RetrievalPanelProps {
  result: QueryResponse | null;
  loading?: boolean;
}

const statusCopy: Record<string, string> = {
  success: "Retrieval matches the stored value closely.",
  degraded: "Retrieval is partially corrupted -- direction is recognizable but noisy.",
  interference: "Retrieval has been overwritten by other stored associations, or the query is too far from any stored key.",
  unknown: "No ground truth was supplied for this query, so quality cannot be scored.",
};

export function RetrievalPanel({ result, loading }: RetrievalPanelProps) {
  return (
    <div className="panel">
      <div className="panel-title">Retrieval panel</div>
      <div className="panel-sub">Ground truth is never hidden, even when retrieval fails.</div>

      {loading && <p className="loading-text">Querying memory\u2026</p>}

      {!loading && !result && (
        <p className="loading-text">Write an association, then query it to see results here.</p>
      )}

      {!loading && result && (
        <>
          <div className="two-col">
            <VectorViewer label="Query" vector={result.query} color="var(--ink-dim)" />
            {result.expected_value ? (
              <VectorViewer label="Expected value (ground truth)" vector={result.expected_value} color="var(--truth)" />
            ) : (
              <div className="loading-text">No expected value supplied.</div>
            )}
          </div>
          <div className="two-col" style={{ marginTop: 8 }}>
            <VectorViewer label="Retrieved value" vector={result.retrieved_value} color="var(--live)" />
            <div>
              <div className="readout-row">
                <span className="readout-label">Similarity (cosine)</span>
                <span className="readout-value">{result.similarity == null ? "\u2014" : result.similarity.toFixed(4)}</span>
              </div>
              <div className="readout-row">
                <span className="readout-label">Normalized L2 error</span>
                <span className="readout-value">{result.error == null ? "\u2014" : result.error.toFixed(4)}</span>
              </div>
              <div className="readout-row">
                <span className="readout-label">Method</span>
                <span className="readout-value">{result.method}</span>
              </div>
              <div className="readout-row">
                <span className="readout-label">Status</span>
                <span className={`badge status-${result.status}`}>
                  <span className="dot" />{result.status}
                </span>
              </div>
            </div>
          </div>
          <p className="note">{statusCopy[result.status] ?? statusCopy.unknown}</p>
        </>
      )}
    </div>
  );
}
