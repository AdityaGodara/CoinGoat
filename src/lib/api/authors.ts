import type { Article, Author } from "@/types";
import { getArticles } from "./articles";
import { getSanityAuthors } from "./sanity/posts";

// The backend has no dedicated author-listing endpoint or rich author
// profiles — bylines are synthesized per-article (see
// src/lib/api/backend/authors.ts). This derives a directory from the same
// latest-articles pool `getArticles()` already fetches (now merged with
// Sanity posts too), which is necessarily a snapshot of authors active in
// recent coverage, not an exhaustive historical roster — EXCEPT for Sanity
// authors, who are real documents with their own listing endpoint
// (`getSanityAuthors`), so they're unioned in even if their posts happen to
// have aged out of the pool.

async function getAuthorPool(): Promise<Article[]> {
  return getArticles();
}

export async function getAuthors(): Promise<Author[]> {
  const [pool, sanityAuthors] = await Promise.all([getAuthorPool(), getSanityAuthors()]);
  const seen = new Map<string, Author>();
  for (const article of pool) {
    if (!seen.has(article.author.slug)) {
      seen.set(article.author.slug, article.author);
    }
  }
  // Sanity's own authoritative list wins on collision — it's the richer,
  // real profile, versus a byline-derived one that could only happen if a
  // Sanity author's name collided with a synthesized backend byline slug.
  for (const author of sanityAuthors) {
    seen.set(author.slug, author);
  }
  return Array.from(seen.values());
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  const authors = await getAuthors();
  return authors.find((author) => author.slug === slug);
}

export async function getArticlesByAuthor(authorSlug: string): Promise<Article[]> {
  const pool = await getAuthorPool();
  return pool
    .filter((article) => article.author.slug === authorSlug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
