// Deterministic, local, dependency-free text -> vector projection.
// This is explicitly a toy demonstration mechanism (Mode 2 in the spec), not
// a trained embedding model and not the authoritative substrate of the
// project (that's the numeric FastWeightMemory engine on the backend).
// No external embedding API is called -- everything here runs in-browser.
//
// Method: hash each character 3-gram of the (lowercased) text with a small
// deterministic string hash, use it to seed per-dimension pseudo-random
// contributions, and average. Same string always maps to the same vector.

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function textToVector(text: string, dimension: number): number[] {
  const clean = text.trim().toLowerCase();
  if (clean.length === 0) return new Array(dimension).fill(0);

  const grams: string[] = [];
  const padded = `  ${clean}  `;
  for (let i = 0; i < padded.length - 2; i++) {
    grams.push(padded.slice(i, i + 3));
  }
  if (grams.length === 0) grams.push(clean);

  const acc = new Array(dimension).fill(0);
  for (const gram of grams) {
    const seed = hashString(gram);
    const rand = mulberry32(seed);
    for (let d = 0; d < dimension; d++) {
      acc[d] += rand() * 2 - 1;
    }
  }
  const norm = Math.sqrt(acc.reduce((s, x) => s + x * x, 0)) || 1;
  return acc.map((x) => x / norm);
}
