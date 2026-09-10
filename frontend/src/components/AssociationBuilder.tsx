import { useState } from "react";
import "./panel.css";
import { textToVector } from "../lib/textVector";

interface AssociationBuilderProps {
  dimension: number;
  onSubmit: (key: number[], value: number[], label?: string) => void;
  onAutoGenerate: () => void;
  disabled?: boolean;
}

function randomVec(dim: number): number[] {
  return Array.from({ length: dim }, () => +(Math.random() * 2 - 1).toFixed(3));
}

export function AssociationBuilder({ dimension, onSubmit, onAutoGenerate, disabled }: AssociationBuilderProps) {
  const [mode, setMode] = useState<"vector" | "text">("vector");
  const [keyVec, setKeyVec] = useState<number[]>(() => randomVec(dimension));
  const [valVec, setValVec] = useState<number[]>(() => randomVec(dimension));
  const [keyText, setKeyText] = useState("");
  const [valText, setValText] = useState("");

  const setKeyComponent = (i: number, v: string) => {
    const next = [...keyVec];
    next[i] = parseFloat(v) || 0;
    setKeyVec(next);
  };
  const setValComponent = (i: number, v: string) => {
    const next = [...valVec];
    next[i] = parseFloat(v) || 0;
    setValVec(next);
  };

  const submitVector = () => onSubmit(keyVec, valVec);
  const submitText = () => {
    const kv = textToVector(keyText, dimension);
    const vv = textToVector(valText, dimension);
    onSubmit(kv, vv, `"${keyText}" \u2192 "${valText}"`);
  };

  return (
    <div className="panel">
      <div className="panel-title">Association builder</div>
      <div className="panel-sub">
        Mode 1 is the authoritative numeric substrate. Mode 2 is a local, deterministic text
        projection layered on top of it for demonstration -- not a trained embedding model.
      </div>

      <div className="btn-row" style={{ marginBottom: 16 }}>
        <button onClick={() => setMode("vector")} className={mode === "vector" ? "primary" : ""}>
          Mode 1 \u2014 Vector experiment
        </button>
        <button onClick={() => setMode("text")} className={mode === "text" ? "primary" : ""}>
          Mode 2 \u2014 Text-to-vector demo
        </button>
      </div>

      {mode === "vector" && (
        <>
          <div style={{ marginBottom: 10 }}>
            <label className="mono" style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>key (k)</label>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
              {keyVec.map((v, i) => (
                <input key={i} type="number" step="0.1" value={v} style={{ width: 62 }}
                       onChange={(e) => setKeyComponent(i, e.target.value)} aria-label={`key component ${i}`} />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="mono" style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>value (v)</label>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
              {valVec.map((v, i) => (
                <input key={i} type="number" step="0.1" value={v} style={{ width: 62 }}
                       onChange={(e) => setValComponent(i, e.target.value)} aria-label={`value component ${i}`} />
              ))}
            </div>
          </div>
          <div className="btn-row">
            <button className="primary" onClick={submitVector} disabled={disabled}>Write association</button>
            <button onClick={() => { setKeyVec(randomVec(dimension)); setValVec(randomVec(dimension)); }} disabled={disabled}>
              Randomize k, v
            </button>
            <button onClick={onAutoGenerate} disabled={disabled}>Write server-seeded random pair</button>
          </div>
        </>
      )}

      {mode === "text" && (
        <>
          <div className="control-grid" style={{ marginBottom: 12 }}>
            <div className="control-field">
              <label>key phrase</label>
              <input type="text" value={keyText} onChange={(e) => setKeyText(e.target.value)} placeholder="e.g. capital of France" />
            </div>
            <div className="control-field">
              <label>value phrase</label>
              <input type="text" value={valText} onChange={(e) => setValText(e.target.value)} placeholder="e.g. Paris" />
            </div>
          </div>
          <p className="note">
            Text is converted to a {dimension}-dim vector in-browser via a deterministic
            character-trigram hash (see <code>lib/textVector.ts</code>) -- the same phrase always
            maps to the same vector, and no external embedding API is called. This is a
            demonstration convenience layered on top of the vector mechanism, not a claim about
            semantic embedding quality.
          </p>
          <div className="btn-row">
            <button className="primary" onClick={submitText} disabled={disabled || !keyText || !valText}>
              Write association
            </button>
          </div>
        </>
      )}
    </div>
  );
}
