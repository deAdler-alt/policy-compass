import { NextResponse } from "next/server";

import { answerQuestion } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const question =
    "question" in body && typeof body.question === "string" ? body.question.trim() : "";

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const result = answerQuestion(question);

  if (result.status === "no_evidence") {
    return NextResponse.json({
      status: "no_evidence",
      message: "No supporting passage found in the uploaded sources.",
      score: result.score,
    });
  }

  return NextResponse.json({
    status: "ok",
    answer: result.answer,
    quote: result.quote,
    source: result.source,
    score: result.score,
  });
}
