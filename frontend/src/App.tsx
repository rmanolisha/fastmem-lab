import { useEffect, useState } from "react";
import "./App.css";
import { useSession } from "./hooks/useSession";
import { api, getLastLatencyMs } from "./lib/api";
import { Sidebar, STATIONS } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { Overview } from "./pages/Overview";
import { Mechanism } from "./pages/Mechanism";
import { LiveMemory } from "./pages/LiveMemory";
import { Retrieval } from "./pages/Retrieval";
import { ExperimentDashboard } from "./pages/ExperimentDashboard";
import { Baseline } from "./pages/Baseline";
import { Theory } from "./pages/Theory";
import { Limitations } from "./pages/Limitations";
import type { ExperimentParams } from "./components/ExperimentControls";
import type { ExperimentResponse, CompareResponse, NoiseSweepResponse } from "./types/api";

// Last verified backend test run, sourced from STATUS.md -- not queried live
// (there is no test-results API), but not invented either: it reflects the
// actual `pytest -v` run documented in this repository at delivery time.
const LAST_VERIFIED_TESTS_PASSING = 32;
const LAST_VERIFIED_TESTS_TOTAL = 32;

function App() {
  const session = useSession(8, 1.0, 42);
  const [apiUp, setApiUp] = useState<boolean | null>(null);
  const [active, setActive] = useState(STATIONS[0].id);
  const [mode, setMode] = useState("IDLE");
  const [latencyTick, setLatencyTick] = useState(0);

  useEffect(() => {
    api.health().then(() => setApiUp(true)).catch(() => setApiUp(false));
  }, []);

  const [expParams, setExpParams] = useState<ExperimentParams>({
    dimension: 8, learningRate: 0.5, numAssociations: 40, numProbes: 5, seed: 42,
  });
  const [expResult, setExpResult] = useState<ExperimentResponse | null>(null);
  const [expLoading, setExpLoading] = useState(false);
  const [expMethod, setExpMethod] = useState<"fast_weight" | "nearest_neighbor">("fast_weight");

  const runExperiment = async () => {
    setExpLoading(true);
    setMode("EXPERIMENT_RUN");
    try {
      const res = await api.runExperiment(
        expParams.dimension, expParams.numAssociations, expParams.learningRate,
        expParams.seed, expParams.numProbes, expMethod
      );
      setExpResult(res);
    } finally {
      setExpLoading(false);
      setLatencyTick((t) => t + 1);
    }
  };

  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const runCompare = async () => {
    setCompareLoading(true);
    setMode("BASELINE_COMPARE");
    try {
      const res = await api.compareExperiment(
        expParams.dimension, expParams.numAssociations, expParams.learningRate,
        expParams.seed, expParams.numProbes
      );
      setCompareResult(res);
    } finally {
      setCompareLoading(false);
      setLatencyTick((t) => t + 1);
    }
  };

  const [noiseResult, setNoiseResult] = useState<NoiseSweepResponse | null>(null);
  const [noiseLoading, setNoiseLoading] = useState(false);
  const runNoise = async () => {
    setNoiseLoading(true);
    setMode("NOISE_SWEEP");
    try {
      const res = await api.noiseSweep(expParams.dimension, expParams.learningRate, expParams.seed);
      setNoiseResult(res);
    } finally {
      setNoiseLoading(false);
      setLatencyTick((t) => t + 1);
    }
  };

  const handleWriteFromBuilder = (key: number[], value: number[], label?: string) => {
    setMode("ASSOC_WRITE");
    session.write(key, value, label, false).then(() => setLatencyTick((t) => t + 1));
  };

  const handleQueryLastWritten = () => {
    if (session.lastWrite) {
      setMode("ASSOC_QUERY");
      session.query(session.lastWrite.key, session.lastWrite.value, "fast_weight").then(() => setLatencyTick((t) => t + 1));
    }
  };

  const renderStation = () => {
    switch (active) {
      case "overview":
        return <Overview testsPassing={LAST_VERIFIED_TESTS_PASSING} testsTotal={LAST_VERIFIED_TESTS_TOTAL} />;
      case "mechanism":
        return <Mechanism />;
      case "live-memory":
        return (
          <LiveMemory
            dimension={session.dimension}
            learningRate={session.learningRate}
            seed={session.seed}
            matrix={session.matrix}
            changedCells={session.changedCells}
            state={session.state}
            error={session.error}
            busy={session.busy}
            sessionId={session.sessionId}
            onWrite={handleWriteFromBuilder}
            onAutoGenerate={() => { setMode("ASSOC_WRITE"); session.write(undefined, undefined, undefined, true).then(() => setLatencyTick((t) => t + 1)); }}
            onReset={() => { setMode("RESET"); session.reset().then(() => setLatencyTick((t) => t + 1)); }}
          />
        );
      case "retrieval":
        return (
          <Retrieval
            lastWrite={session.lastWrite}
            lastQuery={session.lastQuery}
            busy={session.busy}
            onQueryLastWritten={handleQueryLastWritten}
          />
        );
      case "experiment":
        return (
          <ExperimentDashboard
            params={expParams}
            onParamsChange={setExpParams}
            method={expMethod}
            onMethodChange={setExpMethod}
            expResult={expResult}
            expLoading={expLoading}
            onRun={runExperiment}
            onReset={() => setExpResult(null)}
            noiseResult={noiseResult}
            noiseLoading={noiseLoading}
            onRunNoise={runNoise}
          />
        );
      case "baseline":
        return <Baseline result={compareResult} loading={compareLoading} onRun={runCompare} />;
      case "theory":
        return <Theory />;
      case "limitations":
        return <Limitations testsPassing={LAST_VERIFIED_TESTS_PASSING} testsTotal={LAST_VERIFIED_TESTS_TOTAL} />;
      default:
        return null;
    }
  };

  return (
    <div className="console-shell">
      <Sidebar active={active} onSelect={setActive} learningRate={session.learningRate} />
      <div>
        <TopBar
          apiUp={apiUp}
          dimension={session.dimension}
          numAssociations={session.state?.num_associations ?? 0}
          latencyMs={latencyTick >= 0 ? getLastLatencyMs() : null}
          mode={mode}
        />
        {renderStation()}
      </div>
    </div>
  );
}

export default App;
