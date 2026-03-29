import { randomUUID } from "crypto";

import { chunkDocument } from "./chunk";
import { firstSentence } from "./text";
import { buildRetriever } from "./tfidf";

export type IndexedChunk = {
  id: string;
  documentId: string;
  documentName: string;
  text: string;
  order: number;
};

export type IndexedDocument = {
  id: string;
  name: string;
  chunkCount: number;
  createdAt: string;
};

type InternalState = {
  documents: Map<string, { name: string; createdAt: string; chunks: IndexedChunk[] }>;
};

const globalStore: InternalState = {
  documents: new Map(),
};

function rebuildChunksArray(): IndexedChunk[] {
  const all: IndexedChunk[] = [];
  for (const doc of globalStore.documents.values()) {
    all.push(...doc.chunks);
  }
  return all;
}

export function listDocuments(): IndexedDocument[] {
  const out: IndexedDocument[] = [];
  for (const [id, doc] of globalStore.documents) {
    out.push({
      id,
      name: doc.name,
      chunkCount: doc.chunks.length,
      createdAt: doc.createdAt,
    });
  }
  return out;
}

export function addDocument(name: string, content: string): { document: IndexedDocument; chunks: IndexedChunk[] } {
  const trimmedName = name.trim() || "document.md";
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("Document content is empty.");
  }

  const documentId = randomUUID();
  const createdAt = new Date().toISOString();
  const parts = chunkDocument(trimmedContent);

  const chunks: IndexedChunk[] = parts.map((text, order) => ({
    id: randomUUID(),
    documentId,
    documentName: trimmedName,
    text,
    order,
  }));

  globalStore.documents.set(documentId, {
    name: trimmedName,
    createdAt,
    chunks,
  });

  return {
    document: {
      id: documentId,
      name: trimmedName,
      chunkCount: chunks.length,
      createdAt,
    },
    chunks,
  };
}

export function clearDocuments(): void {
  globalStore.documents.clear();
}

export function answerQuestion(question: string, minScore = 0.06): {
  status: "ok" | "no_evidence";
  answer?: string;
  quote?: string;
  source?: string;
  score?: number;
} {
  const chunks = rebuildChunksArray();
  if (chunks.length === 0) {
    return { status: "no_evidence" };
  }

  const texts = chunks.map((c) => c.text);
  const retrieve = buildRetriever(texts);
  const { index, score } = retrieve(question);

  if (score < minScore) {
    return { status: "no_evidence", score };
  }

  const best = chunks[index];
  return {
    status: "ok",
    answer: firstSentence(best.text),
    quote: best.text.trim(),
    source: best.documentName,
    score,
  };
}
