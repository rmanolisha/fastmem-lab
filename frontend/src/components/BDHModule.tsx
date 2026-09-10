import "./panel.css";

export function BDHModule() {
  return (
    <div className="panel">
      <div className="panel-title">Fast weights \u2192 BDH</div>
      <div className="panel-sub" style={{ color: "var(--warn)" }}>
        Independent educational implementation inspired by the published mechanism \u2014 not the
        official BDH codebase, not a reproduction of BDH's benchmarks.
      </div>

      <h4 style={{ fontSize: 13, margin: "16px 0 8px" }}>1. What the published architecture claims</h4>
      <p>
        <em>Dragon Hatchling</em> (BDH) is a scale-free, biologically inspired large language model
        architecture from Pathway (Kosowski et al., 2025, arXiv:2509.26507). It reframes a
        Transformer-style model as a network of locally interacting neuron particles whose working
        memory during inference is implemented through <strong>synaptic plasticity driven by
        Hebbian learning</strong> \u2014 the model's short-term memory lives in changing connection
        strengths between neurons, distinct from its slower, gradient-trained parameters. The
        paper reports that individual synapses measurably strengthen when the model processes a
        specific concept, and that a GPU-efficient variant (BDH-GPU) approximates this dynamics via
        mean-field interaction and low-rank factorization, derived directly from the attention
        equations.
      </p>

      <h4 style={{ fontSize: 13, margin: "16px 0 8px" }}>2. Relevant published mechanism (paraphrased, not verbatim)</h4>
      <p>
        Both the BDH paper and the broader fast-weight-programmer literature (Irie &amp; Gershman,
        2025, arXiv:2508.08435) describe the same underlying shape: a network's evolving state is a
        <strong> 2D matrix</strong> updated online by a local, correlation-based rule as a function
        of what the network is currently processing \u2014 not by backpropagating a loss through the
        whole system at inference time. Irie &amp; Gershman formalize this as a
        "correlation matrix memory" whose write is an <strong>outer product of a key and value
        signal</strong> and whose read is a <strong>matrix-vector product</strong> against a query
        \u2014 precisely the write/retrieve pair this project implements.
      </p>

      <h4 style={{ fontSize: 13, margin: "16px 0 8px" }}>3. Architecture diagram</h4>
      <div className="equation-block" style={{ color: "var(--ink)" }}>
{`Published BDH (conceptual)              This project (independent)
------------------------              --------------------------
input tokens                          key k, value v
      |                                     |
neuron / state activity                (no neuron population --
      |                                  direct vector inputs)
Hebbian / synaptic update                    |
      |                                W <- W + eta (k v^T)
changing internal memory  <----------->      W  (d x d matrix)
      |                                      |
next recurrent computation             retrieval: v_hat = W^T q`}
      </div>

      <h4 style={{ fontSize: 13, margin: "16px 0 8px" }}>4. Side-by-side comparison</h4>
      <table className="data-table">
        <thead>
          <tr><th></th><th>Published BDH</th><th>This project</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Update rule</td>
            <td>Hebbian synaptic update over spiking neuron particles</td>
            <td>Hebbian outer-product update over dense real vectors</td>
          </tr>
          <tr>
            <td>Memory substrate</td>
            <td>Population of sparse, spiking neurons with excitatory/inhibitory structure</td>
            <td>Single dense d&times;d matrix</td>
          </tr>
          <tr>
            <td>Context</td>
            <td>Embedded in a full sequence-model architecture, trained end-to-end on language</td>
            <td>Standalone associative-memory primitive, no surrounding model, no training run</td>
          </tr>
          <tr>
            <td>Reported results</td>
            <td>GPT-2-comparable scaling, Sudoku-Extreme accuracy, monosemantic synapses (Pathway's own experiments)</td>
            <td>None of the above are reproduced or implied \u2014 only the interference/capacity/noise experiments in this lab</td>
          </tr>
        </tbody>
      </table>

      <h4 style={{ fontSize: 13, margin: "16px 0 8px" }}>5. What is implemented locally</h4>
      <p>The Hebbian outer-product write, matrix-vector retrieval, capacity/interference behavior under a fixed-size matrix, and comparison against an unbounded nearest-neighbor baseline \u2014 all live NumPy computation in this repository.</p>

      <h4 style={{ fontSize: 13, margin: "16px 0 8px" }}>6. What is not implemented</h4>
      <p>Spiking neuron dynamics, sparse/scale-free connectivity, integrate-and-fire thresholding, the surrounding attention/sequence-model architecture, any training run, and any of BDH's reported benchmark results.</p>

      <h4 style={{ fontSize: 13, margin: "16px 0 8px" }}>7. Why the simplified experiment is still useful</h4>
      <p>
        It isolates the one mechanism both systems share \u2014 a directly, Hebbian-updated matrix of
        associations \u2014 from everything else in BDH's architecture, so the capacity/interference
        trade-off can be measured and manipulated directly rather than inferred from a much larger
        system's aggregate behavior.
      </p>

      <h4 style={{ fontSize: 13, margin: "16px 0 8px" }}>8. Sources</h4>
      <p style={{ fontSize: 12.5 }}>
        Kosowski, Uznański, Chorowski, Stamirowska, Bartoszkiewicz. <em>The Dragon Hatchling: The
        Missing Link between the Transformer and Models of the Brain.</em> arXiv:2509.26507 (2025).{" "}
        <a href="https://arxiv.org/abs/2509.26507" target="_blank" rel="noreferrer">arxiv.org/abs/2509.26507</a>
        {" \u00B7 "}
        Official code: <a href="https://github.com/pathwaycom/bdh" target="_blank" rel="noreferrer">github.com/pathwaycom/bdh</a>
        {" \u00B7 "}
        Irie &amp; Gershman. <em>Fast weight programming and linear transformers: from machine
        learning to neurobiology.</em> arXiv:2508.08435 (2025).{" "}
        <a href="https://arxiv.org/abs/2508.08435" target="_blank" rel="noreferrer">arxiv.org/abs/2508.08435</a>
      </p>

      <h4 style={{ fontSize: 13, margin: "16px 0 8px" }}>9. Evidence labeling</h4>
      <div className="btn-row">
        <span className="badge live"><span className="dot" />our W matrix: live computation</span>
        <span className="badge analytical">BDH architecture claims: published/research evidence, not verified here</span>
        <span className="badge synthetic">diagram: our own summary, paraphrased from the sources above</span>
      </div>
    </div>
  );
}
