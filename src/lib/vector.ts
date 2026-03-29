/**
 * L2-normalise a dense vector (typical for sentence embeddings).
 */
export function l2Normalize(vector: number[]): number[] {
  let sum = 0;
  for (const x of vector) {
    sum += x * x;
  }
  const mag = Math.sqrt(sum);
  if (mag === 0) {
    return vector;
  }
  return vector.map((x) => x / mag);
}

/**
 * Cosine similarity for L2-normalised vectors (equals dot product).
 */
export function dotProduct(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < len; i++) {
    s += a[i] * b[i];
  }
  return s;
}
