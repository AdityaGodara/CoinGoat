import GithubSlugger from "github-slugger";

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

// Matches markdown `## `/`### ` lines (backend/RSS content) OR literal
// `<h2>`/`<h3>` HTML tags (Sanity content, serialized from Portable Text
// headings via @portabletext/to-html's defaults — see
// src/lib/api/sanity/transform.ts). Both branches feed the same
// github-slugger call below, which is also what rehype-slug uses when
// ArticleBody actually renders the heading — that shared algorithm on the
// same text is the entire reason TOC ids and rendered heading ids match,
// for either content shape.
const HEADING_PATTERN = /^(#{2,3})[ \t]+(.*)$|<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\3>/gm;

export function extractHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  for (const match of content.matchAll(HEADING_PATTERN)) {
    const [, markdownHashes, markdownText, htmlDepth, htmlInner] = match;
    const depth = (markdownHashes ? markdownHashes.length : Number(htmlDepth)) as 2 | 3;
    const rawText = markdownHashes ? markdownText : htmlInner;
    const text = rawText.replace(/<[^>]*>/g, "").trim();
    if (!text) continue;
    headings.push({ id: slugger.slug(text), text, depth });
  }
  return headings;
}
