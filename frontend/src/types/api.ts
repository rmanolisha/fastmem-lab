// Mirrors backend/app/models/schemas.py exactly. Keep in sync by hand -- no
// codegen in this project, so any backend schema change must be reflected here.

export interface CreateMemoryResponse {
  session_id: string;
  dimension: number;
  learning_rate: number;
  seed: number;
  matrix: number[][];
}

export interface WriteResponse {
  association_id: number;
  key: number[];
  value: number[];
  matrix_before: number[][];
  matrix_after: number[][];
  changed_cells: [number, number][];
  num_associations: number;
  frobenius_norm: number;
}

export type RetrievalStatus = "success" | "degraded" | "interference" | "unknown";

export interface QueryResponse {
  query: number[];
  expected_value: number[] | null;
  retrieved_value: number[];
  similarity: number | null;
  error: number | null;
  status: RetrievalStatus;
  method: "fast_weight" | "nearest_neighbor";
  matched_association_id: number | null;
}

export interface ResetResponse {
  session_id: string;
  matrix: number[][];
}

export interface StateResponse {
  session_id: string;
  dimension: number;
  learning_rate: number;
  num_associations: number;
  matrix: number[][];
  frobenius_norm: number;
  associations: { id: number; key: number[]; value: number[]; label: string | null }[];
}

export interface ProbePoint {
  step: number;
  probe_id: number;
  similarity: number;
  error: number;
  status: RetrievalStatus;
}

export interface ExperimentResponse {
  dimension: number;
  learning_rate: number;
  num_associations: number;
  num_probes: number;
  seed: number;
  method: "fast_weight" | "nearest_neighbor";
  points: ProbePoint[];
}

export interface CompareResponse {
  fast_weight: ExperimentResponse;
  nearest_neighbor: ExperimentResponse;
}

export interface NoiseSweepResponse {
  noise_levels: number[];
  similarities: number[];
  errors: number[];
  seed: number;
  dimension: number;
  learning_rate: number;
  method: string;
}
