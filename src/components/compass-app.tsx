"use client";

import { useCallback, useEffect, useState } from "react";

type DocumentItem = {
  id: string;
  name: string;
  chunkCount: number;
  createdAt: string;
};

type AskOk = {
  status: "ok";
  answer: string;
  quote: string;
  source: string;
  retrieval?: "embedding" | "tfidf";
};

type AskNo = {
  status: "no_evidence";
  message: string;
  retrieval?: "embedding" | "tfidf";
};

type Meta = {
  hfTokenConfigured: boolean;
  embeddingsDisabled: boolean;
  embeddingModel: string;
  databasePathHint: string;
  retrievalHint: string;
};

export function CompassApp() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [fileName, setFileName] = useState("");
  const [paste, setPaste] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [result, setResult] = useState<AskOk | AskNo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);

  const refreshDocs = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (!res.ok) {
      setError("Could not load documents.");
      return;
    }
    const data = (await res.json()) as { documents: DocumentItem[] };
    setDocuments(data.documents);
  }, []);

  useEffect(() => {
    void refreshDocs();
  }, [refreshDocs]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/meta");
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as Meta;
        setMeta(data);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function loadSeed() {
    setSeedLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seed");
      if (!res.ok) {
        throw new Error("Seed unavailable");
      }
      const data = (await res.json()) as { name: string; content: string };
      const post = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, content: data.content }),
      });
      if (!post.ok) {
        const err = (await post.json()) as { error?: string };
        throw new Error(err.error ?? "Upload failed");
      }
      setPaste("");
      setFileName("");
      await refreshDocs();
    } catch {
      setError("Could not load the sample policy. Try pasting text manually.");
    } finally {
      setSeedLoading(false);
    }
  }

  async function onUploadFile(file: File) {
    setError(null);
    const text = await file.text();
    setFileName(file.name);
    setPaste(text);
  }

  async function ingest() {
    if (!paste.trim()) {
      setError("Add Markdown text or upload a file first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const name = fileName.trim() || "pasted-policy.md";
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content: paste }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Indexing failed");
      }
      await refreshDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Indexing failed.");
    } finally {
      setLoading(false);
    }
  }

  async function ask() {
    if (!question.trim()) {
      setError("Enter a question.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Request failed.");
        return;
      }
      if (data.status === "no_evidence") {
        setResult({
          status: "no_evidence",
          message:
            typeof data.message === "string"
              ? data.message
              : "No supporting passage found in the uploaded sources.",
          retrieval:
            data.retrieval === "embedding" || data.retrieval === "tfidf"
              ? data.retrieval
              : undefined,
        });
        return;
      }
      if (data.status === "ok") {
        setResult({
          status: "ok",
          answer: String(data.answer ?? ""),
          quote: String(data.quote ?? ""),
          source: String(data.source ?? ""),
          retrieval:
            data.retrieval === "embedding" || data.retrieval === "tfidf"
              ? data.retrieval
              : undefined,
        });
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function clearAll() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await fetch("/api/documents", { method: "DELETE" });
      setPaste("");
      setFileName("");
      await refreshDocs();
    } catch {
      setError("Could not clear documents.");
    } finally {
      setLoading(false);
    }
  }

  const totalChunks = documents.reduce((acc, d) => acc + d.chunkCount, 0);

  const retrievalBadge =
    meta &&
    !meta.embeddingsDisabled &&
    meta.hfTokenConfigured &&
    "Embedding retrieval on (HF)";

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Enterprise · internal knowledge
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Policy Compass</h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)]">
                Ask questions about policies and procedures. Answers are grounded in{" "}
                <span className="font-medium text-[var(--foreground)]">verbatim passages</span> from
                your documents—no guesses when evidence is missing.
              </p>
            </div>
            {retrievalBadge ? (
              <span className="inline-flex w-fit items-center rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
                {retrievalBadge}
              </span>
            ) : (
              <span className="inline-flex w-fit items-center rounded-full border border-dashed border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                TF–IDF mode · add HF_TOKEN for embeddings
              </span>
            )}
          </div>
        </header>

        <section className="pc-card p-6 sm:p-7" aria-labelledby="sources-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="sources-heading" className="text-lg font-semibold">
                Sources
              </h2>
              <p className="text-sm text-[var(--muted)]">
                {documents.length === 0
                  ? "No documents indexed yet."
                  : `${documents.length} document(s) · ${totalChunks} passage(s) ready.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadSeed()}
                disabled={seedLoading || loading}
                className="rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:opacity-90 disabled:opacity-50"
              >
                {seedLoading ? "Loading…" : "Load sample policy"}
              </button>
              <button
                type="button"
                onClick={() => void clearAll()}
                disabled={loading || documents.length === 0}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--background)] disabled:opacity-50"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="block text-sm font-medium">Upload a Markdown file</label>
            <input
              type="file"
              accept=".md,text/markdown,text/plain"
              className="text-sm text-[var(--muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUploadFile(file);
              }}
            />
            <label className="block text-sm font-medium">Or paste text</label>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={8}
              placeholder={"# Title\n\nYour internal policy text…"}
              className="pc-input w-full rounded-xl px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void ingest()}
              disabled={loading || !paste.trim()}
              className="w-fit rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? "Indexing…" : "Index document"}
            </button>
          </div>

          {documents.length > 0 && (
            <ul className="mt-6 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--background)]">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-medium">{doc.name}</span>
                  <span className="text-[var(--muted)]">{doc.chunkCount} passages</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pc-card p-6 sm:p-7" aria-labelledby="ask-heading">
          <h2 id="ask-heading" className="text-lg font-semibold">
            Ask a question
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Example: “When is the submission deadline?” (after indexing the sample policy.)
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="pc-input flex-1 rounded-full px-4 py-2.5 text-sm"
              placeholder="Type your question…"
            />
            <button
              type="button"
              onClick={() => void ask()}
              disabled={loading || documents.length === 0}
              className="rounded-full bg-[var(--foreground)] px-6 py-2.5 text-sm font-semibold text-[var(--background)] transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Working…" : "Get answer"}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-[var(--danger)]" role="alert">
              {error}
            </p>
          )}

          {result && result.status === "ok" && (
            <div className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[var(--accent)]">Grounded answer</p>
                {result.retrieval && (
                  <span className="rounded-full bg-[var(--card)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {result.retrieval === "embedding" ? "Embedding retrieval" : "TF–IDF retrieval"}
                  </span>
                )}
              </div>
              <p className="text-base leading-relaxed">{result.answer}</p>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Source passage
                </p>
                <blockquote className="mt-2 border-l-4 border-[var(--accent)] pl-4 text-sm leading-relaxed text-[var(--foreground)]">
                  {result.quote}
                </blockquote>
                <p className="mt-2 text-xs text-[var(--muted)]">Document: {result.source}</p>
              </div>
            </div>
          )}

          {result && result.status === "no_evidence" && (
            <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
              {result.message}
            </p>
          )}
        </section>

        <footer className="pb-8 text-xs leading-relaxed text-[var(--muted)]">
          <p>
            {meta?.retrievalHint ??
              "Retrieval: TF–IDF and optional Hugging Face embeddings when HF_TOKEN is set."}
          </p>
          <p className="mt-2">
            SQLite path: <code className="rounded bg-[var(--accent-soft)] px-1">{meta?.databasePathHint ?? "data/policy-compass.db"}</code> · Model:{" "}
            <code className="rounded bg-[var(--accent-soft)] px-1">{meta?.embeddingModel ?? "—"}</code>
          </p>
          <p className="mt-2">
            See the{" "}
            <a className="underline underline-offset-2" href="/privacy">
              privacy summary
            </a>{" "}
            and <code className="rounded bg-[var(--accent-soft)] px-1">content/samples/</code> for
            test Markdown files.
          </p>
        </footer>
      </div>
    </div>
  );
}
