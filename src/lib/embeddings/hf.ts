import { l2Normalize } from "@/lib/vector";

const DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2500;

function getModel(): string {
  return process.env.HF_EMBEDDINGS_MODEL?.trim() || DEFAULT_MODEL;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseInferenceResponse(data: unknown, expectedRows: number): number[][] {
  if (Array.isArray(data) && data.length > 0) {
    if (typeof data[0] === "number") {
      if (expectedRows !== 1) {
        throw new Error("Unexpected single-vector response for batch request.");
      }
      return [data as number[]];
    }
    if (Array.isArray(data[0])) {
      return data as number[][];
    }
  }
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error?: string }).error ?? "Hugging Face inference error";
    throw new Error(err);
  }
  throw new Error("Unexpected embedding response shape from Hugging Face.");
}

async function postInference(token: string, inputs: string[]): Promise<number[][]> {
  const model = getModel();
  const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
  const body =
    inputs.length === 1 ? { inputs: inputs[0] } : { inputs };

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 503) {
      await sleep(RETRY_DELAY_MS * (attempt + 1));
      lastError = new Error("Model is loading. Retry shortly.");
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Hugging Face HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    const data: unknown = await res.json();
    return parseInferenceResponse(data, inputs.length);
  }

  throw lastError ?? new Error("Hugging Face inference failed after retries.");
}

const BATCH_SIZE = 8;

/**
 * Embed multiple texts using the Hugging Face Inference API (open-source sentence-transformers).
 * Vectors are L2-normalised for cosine search.
 */
export async function embedTexts(texts: string[], token: string): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const vectors = await postInference(token, batch);
    for (const v of vectors) {
      out.push(l2Normalize(v));
    }
  }
  return out;
}

export function getEmbeddingModelId(): string {
  return getModel();
}
