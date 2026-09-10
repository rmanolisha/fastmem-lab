import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./panel.css";
import type { NoiseSweepResponse } from "../types/api";

interface NoiseSweepChartProps {
  result: NoiseSweepResponse | null;
  loading?: boolean;
}

export function NoiseSweepChart({ result, loading }: NoiseSweepChartProps) {
  if (loading) {
    return (
      <div className="panel">
        <div className="panel-title">Query noise sweep</div>
        <p className="loading-text">Running on the live backend\u2026</p>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="panel">
        <div className="panel-title">Query noise sweep</div>
        <p className="loading-text">Run the sweep to see real results here.</p>
      </div>
    );
  }

  const data = result.noise_levels.map((n, i) => ({
    noise: n,
    similarity: result.similarities[i],
    error: result.errors[i],
  }));

  return (
    <div className="panel">
      <div className="panel-title">
        Query noise sweep (q = k + noise)
        <span className="badge live" style={{ marginLeft: 8 }}><span className="dot" />live</span>
      </div>
      <div className="panel-sub">
        One association is written, then queried with increasingly noisy keys. d={result.dimension},
        \u03B7={result.learning_rate}, seed={result.seed}.
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#1E2530" />
          <XAxis dataKey="noise" stroke="#5B6578" tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }}
                 label={{ value: "noise scale (\u03C3)", position: "insideBottom", offset: -4, fill: "#5B6578", fontSize: 11 }} />
          <YAxis stroke="#5B6578" tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#12161F", border: "1px solid #2A3242", fontFamily: "IBM Plex Mono", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
          <Line type="monotone" dataKey="similarity" name="cosine similarity" stroke="#4FD1B8" strokeWidth={2} dot isAnimationActive={false} />
          <Line type="monotone" dataKey="error" name="normalized L2 error" stroke="#E4685D" strokeWidth={2} dot isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="note">
        For a single stored association, retrieval is always a scalar multiple of the stored
        value, so cosine similarity stays pinned near +1 (it only flips sign if noise reverses the
        key/query alignment) -- <strong>error is the metric that actually reveals noise
        degradation</strong> here. This is a real, verified property of the mechanism (see
        research/equations.md), not a display bug.
      </p>
    </div>
  );
}
