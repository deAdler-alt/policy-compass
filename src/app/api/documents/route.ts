import { NextResponse } from "next/server";

import { addDocument, clearDocuments, listDocuments } from "@/lib/store";

export const dynamic = "force-dynamic";

const MAX_BYTES = 512 * 1024;

export async function GET() {
  return NextResponse.json({ documents: listDocuments() });
}

export async function POST(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const name = "name" in body && typeof body.name === "string" ? body.name : "document.md";
  const text = "content" in body && typeof body.content === "string" ? body.content : "";

  if (!text.trim()) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  if (Buffer.byteLength(text, "utf8") > MAX_BYTES) {
    return NextResponse.json({ error: "Document exceeds size limit." }, { status: 413 });
  }

  try {
    const { document } = await addDocument(name, text);
    return NextResponse.json({ document });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to index document.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  clearDocuments();
  return NextResponse.json({ ok: true });
}
