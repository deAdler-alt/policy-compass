const MAX_CHUNK = 520;
const MIN_CHUNK = 120;

function isLonelyMarkdownHeading(paragraph: string): boolean {
  const lines = paragraph.split("\n");
  return (
    lines.length <= 2 &&
    /^#{1,6}\s+\S/.test(paragraph.trim()) &&
    paragraph.length < 220
  );
}

/**
 * Merge consecutive heading-only paragraphs with the first following non-heading
 * paragraph so chunks are not "title + subtitle" without body text.
 */
function mergeLonelyMarkdownHeadings(paragraphs: string[]): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < paragraphs.length) {
    const p = paragraphs[i];
    if (!isLonelyMarkdownHeading(p)) {
      out.push(p);
      i += 1;
      continue;
    }

    const headingRun: string[] = [];
    while (i < paragraphs.length && isLonelyMarkdownHeading(paragraphs[i])) {
      headingRun.push(paragraphs[i]);
      i += 1;
    }

    if (i < paragraphs.length) {
      out.push([...headingRun, paragraphs[i]].join("\n\n"));
      i += 1;
    } else {
      out.push(headingRun.join("\n\n"));
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
