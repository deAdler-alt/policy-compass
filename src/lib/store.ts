import { randomUUID } from "crypto";

import { chunkDocument } from "./chunk";
import { getDb } from "./db";
import { embedTexts, getEmbeddingModelId } from "./embeddings/hf";
import { getHfToken, isEmbeddingsDisabled } from "./env";
import { firstSentence } from "./text";
import { buildRetriever } from "./tfidf";
import { dotProduct } from "./vector";

export type IndexedDocument = {
  id: string;
  name: string;
  chunkCount: number;
  createdAt: string;
};

export type AnswerResult = {
  status: "ok" | "no_evidence";
  answer?: string;
  quote?: string;
  source?: string;
  score?: number;
  retrieval?: "embedding" | "tfidf";
};

type ChunkRow = {
  text: string;
  document_name: string;
  embedding: number[] | null;
};

const MIN_TFIDF_SCORE = 0.06;
/** Below this cosine similarity, we fall back to TF–IDF (lexical match). */
const MIN_COSINE_SCORE = 0.18;

function loadChunkRows(): ChunkRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT text, document_name, embedding_json AS emb FROM chunks
       ORDER BY document_id, chunk_order`,
    )
    .all() as { text: string; document_name: string; emb: string | null }[];

  return rows.map((r) => ({
    text: r.text,
    document_name: r.document_name,
    embedding: r.emb ? (JSON.parse(r.emb) as number[]) : null,
  }));
}

export function listDocuments(): IndexedDocument[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT d.id, d.name, d.created_at AS createdAt,
              (SELECT COUNT(*) FROM chunks c WHERE c.document_id = d.id) AS chunkCount
       FROM documents d
       ORDER BY d.created_at DESC`,
    )
    .all() as {
      id: string;
      name: string;
      createdAt: string;
      chunkCount: number;
    }[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    chunkCount: Number(r.chunkCount),
    createdAt: r.createdAt,
  }));
}

export async function addDocument(
  name: string,
  content: string,
): Promise<{ document: IndexedDocument }> {
  const trimmedName = name.trim() || "document.md";
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("Document content is empty.");
  }

  const parts = chunkDocument(trimmedContent);
  if (parts.length === 0) {
    throw new Error("No indexable passages after chunking.");
  }

  const documentId = randomUUID();
  const createdAt = new Date().toISOString();
  const db = getDb();

  const token = getHfToken();
  let embeddings: (number[] | null)[] = parts.map(() => null);

  if (token && !isEmbeddingsDisabled()) {
    try {
      const vectors = await embedTexts(parts, token);
      embeddings = vectors.map((v) => v);
    } catch {
      embeddings = parts.map(() => null);
    }
  }

  const insertDoc = db.prepare(
    `INSERT INTO documents (id, name, created_at) VALUES (?, ?, ?)`,
  );
  const insertChunk = db.prepare(
    `INSERT INTO chunks (id, document_id, document_name, chunk_order, text, embedding_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  const run = db.transaction(() => {
    insertDoc.run(documentId, trimmedName, createdAt);
    parts.forEach((text, order) => {
      const emb = embeddings[order];
      insertChunk.run(
        randomUUID(),
        documentId,
        trimmedName,
        order,
        text,
        emb ? JSON.stringify(emb) : null,
      );
    });
  });
  run();

  return {
    document: {
      id: documentId,
      name: trimmedName,
      chunkCount: parts.length,
      createdAt,
    },
  };
}

export function clearDocuments(): void {
  const db = getDb();
  db.prepare(`DELETE FROM documents`).run();
}

export async function answerQuestion(question: string): Promise<AnswerResult> {
  const rows = loadChunkRows();
  if (rows.length === 0) {
    return { status: "no_evidence" };
  }

  const token = getHfToken();
  const hasEmbeddings = rows.some((r) => r.embedding !== null);
  const canTryEmbedding =
    Boolean(token) && !isEmbeddingsDisabled() && hasEmbeddings;

  if (canTryEmbedding && token) {
    try {
      const queryVectors = await embedTexts([question], token);
      const q = queryVectors[0];
      if (q) {
        let bestIdx = -1;
        let bestScore = -1;
        rows.forEach((row, i) => {
          if (!row.embedding || row.embedding.length !== q.length) {
            return;
          }
          const s = dotProduct(q, row.embedding);
          if (s > bestScore) {
            bestScore = s;
            bestIdx = i;
          }
        });
        if (bestIdx >= 0 && bestScore >= MIN_COSINE_SCORE) {
          const best = rows[bestIdx];
          return {
            status: "ok",
            answer: firstSentence(best.text),
            quote: best.text.trim(),
            source: best.document_name,
            score: bestScore,
            retrieval: "embedding",
          };
        }
      }
    } catch {
      // Fall through to TF–IDF
    }
  }

  const texts = rows.map((r) => r.text);
  const retrieve = buildRetriever(texts);
  const { index, score } = retrieve(question);

  if (score < MIN_TFIDF_SCORE) {
    return { status: "no_evidence", score, retrieval: "tfidf" };
  }

  const best = rows[index];
  return {
    status: "ok",
    answer: firstSentence(best.text),
    quote: best.text.trim(),
    source: best.document_name,
    score,
    retrieval: "tfidf",
  };
}

export function getRetrievalMeta(): {
  hfTokenConfigured: boolean;
  embeddingsDisabled: boolean;
  sqlitePath: string;
  embeddingModel: string;
} {
  return {
    hfTokenConfigured: Boolean(getHfToken()),
    embeddingsDisabled: isEmbeddingsDisabled(),
    sqlitePath: process.env.DATABASE_PATH ?? "data/policy-compass.db",
    embeddingModel: getEmbeddingModelId(),
  };
}
