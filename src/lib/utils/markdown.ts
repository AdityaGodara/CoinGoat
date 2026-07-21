import GithubSlugger from "github-slugger";

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

const HEADING_LINE = /^(#{2,3})\s+(.*)$/gm;

export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  for (const match of markdown.matchAll(HEADING_LINE)) {
    const depth = match[1].length as 2 | 3;
    const text = match[2].trim();
    headings.push({ id: slugger.slug(text), text, depth });
  }
  return headings;
}
