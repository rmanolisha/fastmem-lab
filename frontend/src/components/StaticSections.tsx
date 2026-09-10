import "./panel.css";

export function ClaimSection() {
  return (
    <div className="panel">
      <div className="panel-title">The claim under test</div>
      <div className="equation-block" style={{ color: "var(--ink)", whiteSpace: "pre-wrap" }}>
        "A fast-weight matrix can store and retrieve associations without gradient descent, but
        capacity is bounded and new writes interfere with old ones."
      </div>
      <p className="note">
        This claim is falsifiable and this lab is built to let you falsify or confirm it yourself:
        write associations, query them, and watch retrieval quality change as you add more.
      </p>
    </div>
  );
}

export function MechanismSection() {
  return (
    <div className="panel">
      <div className="panel-title">Mechanism</div>
      <p>
        A key <code>k</code> and value <code>v</code> are vectors in R<sup>d</sup>. The memory is a
        single d&times;d matrix <code>W</code>, initialized to zero. Writing an association updates
        <code> W</code> directly, with no loss function and no gradient:
      </p>
      <div className="equation-block">{`W <- W + \u03B7 (k v\u1D40)          # Hebbian outer-product write`}</div>
      <p>Retrieval multiplies the matrix by a query key:</p>
      <div className="equation-block">{`v\u0302 = W\u1D40 q                  # matrix-vector retrieval`}</div>
      <p>
        Full derivation, the manual worked example, and a documented mathematical subtlety (cosine
        similarity is degenerate for single-association retrieval \u2014 see the noise experiment
        below) are in <code>research/equations.md</code>.
      </p>
    </div>
  );
}

export function ProvenanceSection() {
  return (
    <div className="panel">
      <div className="panel-title">Provenance</div>
      <div className="panel-sub">What's live, what's synthetic, what's analytical, what's published evidence.</div>
      <table className="data-table">
        <thead><tr><th>Component</th><th>Classification</th></tr></thead>
        <tbody>
          <tr><td>Fast-weight matrix, writes, retrieval</td><td><span className="badge live"><span className="dot" />live computation</span></td></tr>
          <tr><td>Nearest-neighbor baseline</td><td><span className="badge live"><span className="dot" />live computation</span></td></tr>
          <tr><td>Interference / noise / dimension / learning-rate experiments</td><td><span className="badge live"><span className="dot" />live computation</span></td></tr>
          <tr><td>Random key/value vectors (Mode 1 auto-generate)</td><td><span className="badge synthetic">synthetic, seeded</span></td></tr>
          <tr><td>Text-to-vector projection (Mode 2)</td><td><span className="badge synthetic">synthetic, deterministic, local</span></td></tr>
          <tr><td>Equations, mathematical explanations</td><td><span className="badge analytical">analytical</span></td></tr>
          <tr><td>BDH architecture description</td><td><span className="badge analytical">published research evidence (linked, not verified by us)</span></td></tr>
        </tbody>
      </table>
      <p className="note">No component in this application is precomputed or scripted; every number is produced by the request you make.</p>
    </div>
  );
}

export function LimitationsSection() {
  return (
    <div className="panel">
      <div className="panel-title">Limitations</div>
      <ol style={{ paddingLeft: 18, color: "var(--ink-dim)", fontSize: 13.5, lineHeight: 1.7 }}>
        <li>Fast-weight capacity is finite: a fixed d&times;d matrix cannot store unboundedly many independent associations without loss.</li>
        <li>Superposition/interference occurs between associations written into the same matrix; the interference experiment shows this directly rather than asserting it.</li>
        <li>Representation quality (key/value structure, orthogonality) affects retrieval; results here use randomly drawn or short-phrase-derived vectors, not curated data.</li>
        <li>This is a simplified associative-memory model \u2014 a purely additive Hebbian outer-product rule, not the delta-rule or gated variants used in more advanced fast-weight programmers.</li>
        <li>It is not a full reproduction of the Dragon Hatchling system: no spiking neurons, no surrounding sequence-model architecture, no training run, and none of BDH's published benchmark results.</li>
        <li>Matrix visualization switches to a compact heatmap above dimension 16 for browser performance and interpretability, not because the underlying computation changes.</li>
        <li>BDH claims in this app are tied to the cited published sources, not inferred from this project's own toy model.</li>
        <li>Backend session state is in-memory only (no database); it resets when the backend process restarts.</li>
      </ol>
    </div>
  );
}
