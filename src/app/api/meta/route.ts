import { NextResponse } from "next/server";

import { getRetrievalMeta } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const meta = getRetrievalMeta();
  return NextResponse.json({
    hfTokenConfigured: meta.hfTokenConfigured,
    embeddingsDisabled: meta.embeddingsDisabled,
    embeddingModel: meta.embeddingModel,
    databasePathHint: meta.sqlitePath,
    retrievalHint: meta.hfTokenConfigured && !meta.embeddingsDisabled
      ? "Embeddings via Hugging Face Inference API when indexing; TF–IDF fallback if needed."
      : "TF–IDF retrieval (set HF_TOKEN for open-source sentence embeddings).",
  });
}
