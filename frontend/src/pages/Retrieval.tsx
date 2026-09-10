import { StationHeader, MetricCard, MetricRow } from "../components/layout/StationHeader";
import { RetrievalPanel } from "../components/RetrievalPanel";
import "../components/panel.css";
import type { QueryResponse, WriteResponse } from "../types/api";

interface RetrievalProps {
  lastWrite: WriteResponse | null;
  lastQuery: QueryResponse | null;
  busy: boolean;
  onQueryLastWritten: () => void;
}

export function Retrieval({ lastWrite, lastQuery, busy, onQueryLastWritten }: RetrievalProps) {
  const status = lastQuery?.status ?? "unknown";
  return (
    <div className="station-body">
      <StationHeader
        stationLabel="STATION 04 // RETRIEVE_VERIFY"
        title="Retrieval Bounds & Target Verification"
        subtitle="Query memory with the key from the most recent write and compare the retrieved value against the ground truth that was actually stored -- retrieval failure is never hidden."
        actions={<button className="primary" onClick={onQueryLastWritten} disabled={!lastWrite || busy}>Query last-written association</button>}
      />

      <MetricRow>
        <MetricCard
          label="Cosine similarity"
          value={lastQuery?.similarity == null ? "\u2014" : lastQuery.similarity.toFixed(4)}
          tone={status === "success" ? "accent" : status === "degraded" ? "warn" : status === "interference" ? "bad" : "default"}
        />
        <MetricCard label="Normalized L2 error" value={lastQuery?.error == null ? "\u2014" : lastQuery.error.toFixed(4)} />
        <MetricCard label="Method" value={lastQuery?.method ?? "\u2014"} />
        <MetricCard
          label="Status"
          value={status.toUpperCase()}
          tone={status === "success" ? "accent" : status === "degraded" ? "warn" : status === "interference" ? "bad" : "default"}
        />
      </MetricRow>

      <RetrievalPanel result={lastQuery} loading={busy && !lastQuery} />
    </div>
  );
}
