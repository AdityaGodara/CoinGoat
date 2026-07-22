import type { Article, Author } from "@/types";
import { getArticles } from "./articles";

// The backend has no dedicated author-listing endpoint or rich author
// profiles — bylines are synthesized per-article (see
// src/lib/api/backend/authors.ts). This derives an author directory from
// the same latest-articles pool `getArticles()` already fetches, so it's
// necessarily a snapshot of authors active in recent coverage, not an
// exhaustive historical roster.

async function getAuthorPool(): Promise<Article[]> {
  return getArticles();
}

export async function getAuthors(): Promise<Author[]> {
  const pool = await getAuthorPool();
  const seen = new Map<string, Author>();
  for (const article of pool) {
    if (!seen.has(article.author.slug)) {
      seen.set(article.author.slug, article.author);
    }
  }
  return Array.from(seen.values());
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  const pool = await getAuthorPool();
  return pool.find((article) => article.author.slug === slug)?.author;
}

export async function getArticlesByAuthor(authorSlug: string): Promise<Article[]> {
  const pool = await getAuthorPool();
  return pool
    .filter((article) => article.author.slug === authorSlug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
