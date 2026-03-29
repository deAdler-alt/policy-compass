const MAX_CHUNK = 520;
const MIN_CHUNK = 120;

/**
 * Merge a short Markdown heading block with the following paragraph so citations
 * include substantive text, not only a heading line.
 */
function mergeLonelyMarkdownHeadings(paragraphs: string[]): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < paragraphs.length) {
    const p = paragraphs[i];
    const lines = p.split("\n");
    const looksLikeHeading =
      lines.length <= 2 && /^#{1,6}\s+\S/.test(p.trim()) && p.length < 220;
    if (looksLikeHeading && i + 1 < paragraphs.length) {
      out.push(`${p}\n\n${paragraphs[i + 1]}`);
      i += 2;
    } else {
      out.push(p);
      i += 1;
    }
  }
  return out;
}

/**
 * Split Markdown/plain text into retrieval-sized chunks for citation-backed QA.
 */
export function chunkDocument(content: string): string[] {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const rawParagraphs = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const paragraphs = mergeLonelyMarkdownHeadings(rawParagraphs);
  const chunks: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= MAX_CHUNK) {
      chunks.push(paragraph);
      continue;
    }

    let start = 0;
    while (start < paragraph.length) {
      const end = Math.min(start + MAX_CHUNK, paragraph.length);
      let slice = paragraph.slice(start, end);
      if (end < paragraph.length) {
        const lastSpace = slice.lastIndexOf(" ");
        if (lastSpace > MIN_CHUNK) {
          slice = slice.slice(0, lastSpace);
        }
      }
      chunks.push(slice.trim());
      start += slice.length;
    }
  }

  return chunks.filter((c) => c.length > 0);
}
