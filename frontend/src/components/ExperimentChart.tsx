import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./panel.css";
import type { ExperimentResponse } from "../types/api";

interface ExperimentChartProps {
  result: ExperimentResponse | null;
  loading?: boolean;
  metric?: "similarity" | "error";
}

const PROBE_COLORS = ["#4FD1B8", "#7C93FF", "#E0A342", "#E4685D", "#B37CFF", "#7CE0FF", "#E0D67C", "#7CE0A0", "#E07CCF", "#A0A8B8"];

export function ExperimentChart({ result, loading, metric = "similarity" }: ExperimentChartProps) {
  if (loading) {
    return (
      <div className="panel">
        <div className="panel-title">Interference: probe retrieval vs. associations stored</div>
        <p className="loading-text">Running experiment on the live backend\u2026</p>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="panel">
        <div className="panel-title">Interference: probe retrieval vs. associations stored</div>
        <p className="loading-text">Run an experiment to plot real results here.</p>
      </div>
    );
  }

  const steps = Array.from(new Set(result.points.map((p) => p.step))).sort((a, b) => a - b);
  const probeIds = Array.from(new Set(result.points.map((p) => p.probe_id))).sort((a, b) => a - b);
  const data = steps.map((step) => {
    const row: Record<string, number> = { step };
    for (const pid of probeIds) {
      const pt = result.points.find((p) => p.step === step && p.probe_id === pid);
      if (pt) row[`probe_${pid}`] = metric === "similarity" ? pt.similarity : pt.error;
    }
    return row;
  });

  return (
    <div className="panel">
      <div className="panel-title">
        Interference: probe retrieval vs. associations stored
        <span className="badge live" style={{ marginLeft: 8 }}><span className="dot" />live</span>
      </div>
      <div className="panel-sub">
        {result.num_probes} early associations are held fixed as probes and re-queried after every
        subsequent write. d={result.dimension}, \u03B7={result.learning_rate}, method={result.method},
        seed={result.seed}.
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#1E2530" />
          <XAxis dataKey="step" stroke="#5B6578" tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }}
                 label={{ value: "associations stored", position: "insideBottom", offset: -4, fill: "#5B6578", fontSize: 11 }} />
          <YAxis stroke="#5B6578" tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }}
                 domain={metric === "similarity" ? [-1, 1] : [0, "auto"]}
                 label={{ value: metric === "similarity" ? "cosine similarity" : "normalized L2 error", angle: -90, position: "insideLeft", fill: "#5B6578", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#12161F", border: "1px solid #2A3242", fontFamily: "IBM Plex Mono", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
          {probeIds.map((pid, idx) => (
            <Line key={pid} type="monotone" dataKey={`probe_${pid}`} name={`probe #${pid}`}
                  stroke={PROBE_COLORS[idx % PROBE_COLORS.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="note">
        For fast-weight memory, probe similarity trending downward as more associations are
        superimposed into the same fixed-size matrix is the interference effect the central claim
        predicts. Switch method to nearest-neighbor for comparison -- it stores every association
        explicitly and should not show the same decay.
      </p>
    </div>
  );
}
