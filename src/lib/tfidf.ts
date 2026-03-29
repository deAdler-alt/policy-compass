import { tokenize } from "./text";

export type SparseVector = Map<string, number>;

function addTerm(map: SparseVector, term: string, value: number): void {
  map.set(term, (map.get(term) ?? 0) + value);
}

function magnitude(vec: SparseVector): number {
  let sum = 0;
  for (const v of vec.values()) {
    sum += v * v;
  }
  return Math.sqrt(sum);
}

function dot(a: SparseVector, b: SparseVector): number {
  let sum = 0;
  for (const [term, weight] of a) {
    const other = b.get(term);
    if (other !== undefined) {
      sum += weight * other;
    }
  }
  return sum;
}

function tf(term: string, tokens: string[]): number {
  const count = tokens.filter((t) => t === term).length;
  return tokens.length ? count / tokens.length : 0;
}

/**
 * Build TF–IDF vectors for each chunk and return a scorer against a query.
 */
export function buildRetriever(chunks: string[]): (query: string) => { index: number; score: number } {
  const tokenizedChunks = chunks.map((c) => tokenize(c));
  const docFreq = new Map<string, number>();

  for (const tokens of tokenizedChunks) {
    const unique = new Set(tokens);
    for (const term of unique) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const n = Math.max(tokenizedChunks.length, 1);

  const idf = (term: string): number => {
    const df = docFreq.get(term) ?? 0;
    return Math.log((n + 1) / (df + 1)) + 1;
  };

  const chunkVectors: SparseVector[] = tokenizedChunks.map((tokens) => {
    const vec: SparseVector = new Map();
    for (const term of tokens) {
      const weight = tf(term, tokens) * idf(term);
      addTerm(vec, term, weight);
    }
    return vec;
  });

  return (query: string) => {
    const qTokens = tokenize(query);
    const qVec: SparseVector = new Map();
    for (const term of qTokens) {
      const weight = tf(term, qTokens) * idf(term);
      addTerm(qVec, term, weight);
    }

    const qMag = magnitude(qVec);
    if (qMag === 0) {
      return { index: 0, score: 0 };
    }

    let bestIndex = 0;
    let bestScore = -1;

    chunkVectors.forEach((cVec, index) => {
      const cMag = magnitude(cVec);
      if (cMag === 0) {
        return;
      }
      const score = dot(qVec, cVec) / (qMag * cMag);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    return { index: bestIndex, score: bestScore };
  };
}
