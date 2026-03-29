import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/content/seed-policy.md");
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({
      name: "team-policy-sample.md",
      content,
    });
  } catch {
    return NextResponse.json({ error: "Seed document not found." }, { status: 500 });
  }
}
