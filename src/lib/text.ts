const STOP = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "her",
  "was",
  "one",
  "our",
  "out",
  "has",
  "have",
  "been",
  "this",
  "that",
  "with",
  "from",
  "your",
  "their",
  "will",
  "would",
  "there",
  "what",
  "when",
  "which",
  "who",
  "how",
]);

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export function firstSentence(text: string): string {
  const trimmed = text.trim();
  const withoutHeading = trimmed.replace(/^#{1,6}\s+[^\n]+\n+/, "").trim();
  const body = withoutHeading.length > 0 ? withoutHeading : trimmed;
  const match = body.match(/^[^.!?]+[.!?]?/);
  const sentence = match ? match[0].trim() : body;
  return sentence.length > 280 ? `${sentence.slice(0, 277)}…` : sentence;
}
