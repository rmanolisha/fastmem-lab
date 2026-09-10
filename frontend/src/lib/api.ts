// Thin typed wrapper over the FastMem Lab backend. Every function here makes
// a real HTTP request -- nothing in this file returns synthetic data.
import type {
  CreateMemoryResponse, WriteResponse, QueryResponse, ResetResponse, StateResponse,
  ExperimentResponse, CompareResponse, NoiseSweepResponse,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// Real, measured latency of the most recent API call (milliseconds). Used by
// the console top bar's "RETRIEVE LATENCY" readout -- this is an actual
// measurement (performance.now() delta around fetch), never a hardcoded
// display value.
let _lastLatencyMs: number | null = null;
export function getLastLatencyMs(): number | null {
  return _lastLatencyMs;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const t0 = performance.now();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  _lastLatencyMs = performance.now() - t0;
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? JSON.stringify(body);
    } catch {
      /* ignore parse failure, use statusText */
    }
    throw new Error(`API error ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; service: string }>("/health"),

  createMemory: (dimension: number, learning_rate: number, seed: number, normalize = true) =>
    request<CreateMemoryResponse>("/memory/create", {
      method: "POST",
      body: JSON.stringify({ dimension, learning_rate, seed, normalize }),
    }),

  writeMemory: (session_id: string, key?: number[], value?: number[], label?: string, auto_generate = false) =>
    request<WriteResponse>("/memory/write", {
      method: "POST",
      body: JSON.stringify({ session_id, key, value, label, auto_generate }),
    }),

  queryMemory: (session_id: string, query_key: number[], expected_value?: number[], method: "fast_weight" | "nearest_neighbor" = "fast_weight") =>
    request<QueryResponse>("/memory/query", {
      method: "POST",
      body: JSON.stringify({ session_id, query_key, expected_value, method }),
    }),

  resetMemory: (session_id: string, learning_rate?: number) =>
    request<ResetResponse>("/memory/reset", {
      method: "POST",
      body: JSON.stringify({ session_id, learning_rate }),
    }),

  getState: (session_id: string) => request<StateResponse>(`/memory/${session_id}/state`),

  runExperiment: (dimension: number, num_associations: number, learning_rate: number, seed: number, num_probes: number, method: "fast_weight" | "nearest_neighbor" = "fast_weight") =>
    request<ExperimentResponse>("/experiment/run", {
      method: "POST",
      body: JSON.stringify({ dimension, num_associations, learning_rate, seed, num_probes, method }),
    }),

  compareExperiment: (dimension: number, num_associations: number, learning_rate: number, seed: number, num_probes: number) =>
    request<CompareResponse>("/experiment/compare", {
      method: "POST",
      body: JSON.stringify({ dimension, num_associations, learning_rate, seed, num_probes }),
    }),

  noiseSweep: (dimension: number, learning_rate: number, seed: number, noise_levels?: number[], method: "fast_weight" | "nearest_neighbor" = "fast_weight") =>
    request<NoiseSweepResponse>("/experiment/noise", {
      method: "POST",
      body: JSON.stringify({ dimension, learning_rate, seed, noise_levels, method }),
    }),

  dimensionSweep: (dimensions: number[], num_associations: number, learning_rate: number, seed: number, method: "fast_weight" | "nearest_neighbor" = "fast_weight") =>
    request<ExperimentResponse[]>("/experiment/dimension-sweep", {
      method: "POST",
      body: JSON.stringify({ dimensions, num_associations, learning_rate, seed, method }),
    }),

  learningRateSweep: (dimension: number, num_associations: number, learning_rates: number[], seed: number, method: "fast_weight" | "nearest_neighbor" = "fast_weight") =>
    request<ExperimentResponse[]>("/experiment/learning-rate-sweep", {
      method: "POST",
      body: JSON.stringify({ dimension, num_associations, learning_rates, seed, method }),
    }),
};

export { BASE_URL };
