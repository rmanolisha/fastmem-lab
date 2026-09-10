import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { WriteResponse, QueryResponse, StateResponse } from "../types/api";

export function useSession(initialDimension = 8, initialLearningRate = 1.0, initialSeed = 42) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dimension, setDimension] = useState(initialDimension);
  const [learningRate, setLearningRate] = useState(initialLearningRate);
  const [seed, setSeed] = useState(initialSeed);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [changedCells, setChangedCells] = useState<[number, number][]>([]);
  const [lastWrite, setLastWrite] = useState<WriteResponse | null>(null);
  const [lastQuery, setLastQuery] = useState<QueryResponse | null>(null);
  const [state, setState] = useState<StateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = useCallback(async (dim: number, lr: number, sd: number) => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.createMemory(dim, lr, sd);
      setSessionId(res.session_id);
      setDimension(res.dimension);
      setLearningRate(res.learning_rate);
      setSeed(res.seed);
      setMatrix(res.matrix);
      setChangedCells([]);
      setLastWrite(null);
      setLastQuery(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    create(initialDimension, initialLearningRate, initialSeed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const write = useCallback(async (key?: number[], value?: number[], label?: string, autoGenerate = false) => {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.writeMemory(sessionId, key, value, label, autoGenerate);
      setMatrix(res.matrix_after);
      setChangedCells(res.changed_cells);
      setLastWrite(res);
      const st = await api.getState(sessionId);
      setState(st);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [sessionId]);

  const query = useCallback(async (queryKey: number[], expectedValue?: number[], method: "fast_weight" | "nearest_neighbor" = "fast_weight") => {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.queryMemory(sessionId, queryKey, expectedValue, method);
      setLastQuery(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [sessionId]);

  const reset = useCallback(async (lr?: number) => {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.resetMemory(sessionId, lr);
      setMatrix(res.matrix);
      setChangedCells([]);
      setLastWrite(null);
      setLastQuery(null);
      const st = await api.getState(sessionId);
      setState(st);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [sessionId]);

  return {
    sessionId, dimension, learningRate, seed, matrix, changedCells,
    lastWrite, lastQuery, state, error, busy,
    create, write, query, reset,
  };
}
